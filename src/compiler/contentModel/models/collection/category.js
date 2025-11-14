const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const { join } = require('path')
const {
  isTemplateFile,
  Markdown,
  makePermalink,
  makeDateSlug,
  sort
} = require('../../helpers')
const models = {
  Post: require('./post'),
  facet: require('./facet'),
  Attachment: require('../attachment')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

function linkPosts(post, postIndex, posts) {
  post.links = post.links || {}

  const nextPost = posts[postIndex - 1]
  if (nextPost) {
    post.links.nextPost = {
      title: nextPost.title,
      permalink: nextPost.permalink
    }
  }
  const previousPost = posts[postIndex + 1]
  if (previousPost) {
    post.links.previousPost = {
      title: previousPost.title,
      permalink: previousPost.permalink
    }
  }
}

function serialize(category) {
  return {
    ...category,
    facets: category.facets.map(models.facet().serialize)
  }
}

const defaultSettings = {
  categoryAlias: undefined,
  entryAlias: undefined,
  mode: 'start'
}
module.exports = function Category(settings = defaultSettings, contentTypes, level = 1) {
  const indexFileNameOptions = [settings.categoryAlias, 'category'].filter(Boolean)

  const isCategoryIndexFile = (node) => {
    return isTemplateFile(node) && node.name.match(
      new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
    )
  }

  // copy-pasted from matchers.js
  const matchers = {
    postIndexFile: fsNode => {
      const indexFileNameOptions = [settings.entryAlias, 'post', 'index'].filter(Boolean)
      return (
        isTemplateFile(fsNode) &&
        fsNode.name.match(
          new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
        )
      )
    },

    post: fsNode => {
      return isTemplateFile(fsNode) || fsNode.children?.find(matchers.postIndexFile)
    },

    attachment: fsNode => true
  }

  const draftCheck = (node) => {
    return settings.mode === 'start' || !node.draft
  }

  return {
    serialize,

    draftCheck,

    match: (node) => node.children?.find(childNode => {
      const containsPosts = matchers.post(childNode)
      if (level > 3) {
        return containsPosts
      }
      const containsSubCategories = Category().match(childNode)
      return containsSubCategories || containsPosts
    }),

    create: (node, context) => {
      if (node.isDefaultCategory) {
        const title = context.peek().defaultCategoryName
        const slug = makeSlug(title)
        const { entriesAlias, categoriesAlias } = context.peek()

        const defaultCategory = {
          context,
          contentType: context.peek().categoryContentType,
          categoryContentType: context.peek().categoryContentType,
          entryContentType: context.peek().entryContentType,
          entryAlias: context.peek().entryAlias,
          facetKeys: context.peek().facetKeys || [],
          facets: [],
          sortBy: context.peek().sortBy,
          sortOrder: context.peek().sortOrder,
          content: '',
          contentRaw: '',
          slug,
          title,
          permalink: makePermalink(context.peek().permalink, slug),
          outputPath: join(context.peek().outputPath, slug),
          isDefaultCategory: true,
          posts: [],
          levelPosts: [],
          categories: [],
          attachments: [],
          level
        }

        if (entriesAlias) {
          defaultCategory[entriesAlias] = defaultCategory.posts
        }

        if (categoriesAlias) {
          defaultCategory[categoriesAlias] = defaultCategory.categories
        }

        return defaultCategory
      }

      const indexFile = node.children.find(isCategoryIndexFile)
      const indexProps = indexFile ? frontMatter(indexFile.content) : {}

      const slug = indexProps.attributes?.slug || makeSlug(node.name)
      const permalink = makePermalink(context.peek().permalink, slug)
      const outputPath = join(context.peek().outputPath, slug)

      const categoryContext = {
        ...indexProps.attributes,
        contentType: context.peek().categoryContentType,
        categoryContentType: indexProps.attributes?.categoryContentType || context.peek().categoryContentType,
        entryContentType: indexProps.attributes?.entryContentType || context.peek().entryContentType,
        categoryAlias: indexProps.attributes?.categoryAlias || context.peek().categoryAlias,
        entryAlias: indexProps.attributes?.entryAlias || context.peek().entryAlias,
        categoriesAlias: indexProps.attributes?.categoriesAlias || context.peek().categoriesAlias,
        entriesAlias: indexProps.attributes?.entriesAlias || context.peek().entriesAlias,
        facetKeys: context.peek().facetKeys || [],
        facets: [],
        sortBy: indexProps.attributes?.sortBy || context.peek().sortBy,
        sortOrder: indexProps.attributes?.sortOrder || context.peek().sortOrder,
        title: indexProps.attributes?.title || node.name,
        slug,
        permalink,
        outputPath,
        level
      }

      const tree = {
        categories: [],
        posts: [],
        levelPosts: [],
        attachments: []
      }

      const { entriesAlias, categoriesAlias } = categoryContext

      if (entriesAlias) {
        tree[entriesAlias] = tree.posts
      }

      if (categoriesAlias) {
        tree[categoriesAlias] = tree.categories
      }

      const contextKey = level === 1 ? 'category' : `subCategory${level - 1}`
      node.children.forEach(childNode => {
        const childContext = context.push({
          ...categoryContext,
          key: contextKey
        })

        if (isCategoryIndexFile(childNode)) {
          return
        }
        if (matchers.post(childNode)) {
          const post = new models.Post(
            childNode,
            childContext,
            contentTypes,
            { entryAlias: settings.entryAlias }
          )
          if (draftCheck(post)) {
            tree.levelPosts.push(post)
            tree.posts.push(post)
          }
          return
        }
        if (Category().match(childNode)) {
          const SubCategoryModel = Category({
            entryAlias: categoryContext.entryAlias || settings.entryAlias,
            categoryAlias: categoryContext.categoryAlias || settings.categoryAlias
          }, contentTypes, level + 1)
          const subCategory = SubCategoryModel.create(childNode, childContext)
          if (draftCheck(subCategory)) {
            tree.categories.push(subCategory)
            tree.posts.push(...subCategory.posts)
          }
          return
        }
        if (matchers.attachment(childNode)) {
          return tree.attachments.push(
            new models.Attachment(childNode, childContext)
          )
        }
      })

      const contentRaw = indexProps.body || ''
      const content = indexFile ?
        parseContent(indexFile, contentRaw) :
        ''

      return {
        ...categoryContext,
        ...tree,
        context,
        contentRaw,
        content
      }
    },

    afterEffects: (contentModel, category, collectionFacets) => {
      if (category.facetKeys.length) {
        const categoryContext = _.omit(category, [
          'context',
          'contentRaw',
          'content',
          'categories',
          'posts',
          'attachments',
          'facets'
        ])

        category.facets = models.facet().collectFacets(
          category.posts,
          category.facetKeys,
          category.context.push({
            ...categoryContext,
            key: 'category'
          })
        )
      }

      category.categories.forEach(subCategory => {
        Category().afterEffects(contentModel, subCategory)
      })

      sort(category.posts, category.sortBy, category.sortOrder)
      category.posts.forEach(linkPosts)

      category.attachments.forEach(attachment => {
        attachment.afterEffects(contentModel, attachment)
      })
    },

    render: (renderer, category, { contentModel, settings, debug, facets }) => {
      const renderCategory = () => {
        if (category.isDefaultCategory && !category.slug) {
          return
        }
        return renderer.paginate({
          basePermalink: category.permalink,
          posts: category.posts,
          postsPerPage: category.postsPerPage || 15, //category.context.peek().postsPerPage
          outputDir: category.outputPath,
          render: async ({ outputPath, pageOfPosts, paginationData }) => {
            const data = {
              ...contentModel,
              category: serialize(category),
              pagination: paginationData,
              posts: pageOfPosts,
              settings,
              debug
            }
            const categoryAlias = category.context.peek().categoryAlias
            if (categoryAlias) {
              data[categoryAlias] = data.category
            }
            return renderer.render({
              templates: [
                `pages/${category.template}`,
                `pages/category/${category.contentType}`,
                `pages/category/default`
              ],
              outputPath,
              content: category.content,
              data
            })
          }
        })
      }

      const renderSubCategories = () => {
        return Promise.all(
          category.categories.map(subCategory => {
            return Category().render(renderer, subCategory, { contentModel, settings, debug })
          })
        )
      }

      const renderPosts = () => {
        return Promise.all(
          category.levelPosts.map(post => {
            return post.render(renderer, { contentModel, settings, debug })
          })
        )
      }

      const renderAttachments = () => {
        return Promise.all(
          category.attachments.map(attachment => {
            return attachment.render(renderer, { contentModel, settings, debug })
          })
        )
      }

      const renderFacets = () => {
        if (!category.facets?.length) {
          return
        }
        return models.facet().render(
          renderer, category.facets, { contentModel, settings, debug }
        )
      }

      return Promise.all([
        renderCategory(),
        renderSubCategories(),
        renderPosts(),
        renderAttachments(),
        renderFacets()
      ])
    }
  }
}
