const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const { join } = require('path')
const {
  isTemplateFile,
  Markdown,
  makePermalink,
  makeDateSlug
} = require('../../helpers')
const models = {
  post: require('./post'),
  facet: require('./facet'),
  attachment: require('../attachment')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

function linkPosts(post, postIndex, posts) {
  post.links = post.links || {}
  if (postIndex > 0) {
    post.links.nextPost = {
      title: posts[postIndex - 1].title,
      permalink: posts[postIndex - 1].permalink
    }
  }
  if (postIndex < posts.length - 1) {
    post.links.previousPost = {
      title: posts[postIndex + 1].title,
      permalink: posts[postIndex + 1].permalink
    }
  }
}

const defaultSettings = {
  categoryAlias: undefined,
  entryAlias: undefined
}
module.exports = function Category(settings = defaultSettings, level = 1) {
  const indexFileNameOptions = [settings.categoryAlias, 'category'].filter(Boolean)

  const isCategoryIndexFile = (node) => {
    return isTemplateFile(node) && node.name.match(
      new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
    )
  }

  const childModels = {
    attachment: models.attachment(),
    post: models.post({
      entryAlias: settings.entryAlias
    })
  }

  return {
    linkPosts,

    match: (node) => node.children?.find(childNode => {
      const containsPosts = childModels.post.match(childNode)
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
        if (childModels.post.match(childNode)) {
          const post = childModels.post.create(childNode, childContext)
          tree.levelPosts.push(post)
          tree.posts.push(post)
          return
        }
        if (Category().match(childNode)) {
          const SubCategoryModel = Category({
            entryAlias: categoryContext.entryAlias || settings.entryAlias,
            categoryAlias: categoryContext.categoryAlias || settings.categoryAlias
          }, level + 1)
          const subCategory = SubCategoryModel.create(childNode, childContext)
          tree.categories.push(subCategory)
          tree.posts.push(...subCategory.posts)
          return
        }
        if (childModels.attachment.match(childNode)) {
          return tree.attachments.push(
            childModels.attachment.create(childNode, childContext)
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

    afterEffects: (contentModel, category) => {
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

      category.posts.sort((a, b) => b.date - a.date)
      category.posts.forEach(linkPosts)

      category.attachments.forEach(attachment => {
        models.attachment().afterEffects(contentModel, attachment)
      })
    },

    render: (renderer, category, { contentModel, settings, debug }) => {
      const renderCategory = () => {
        return renderer.paginate({
          page: category,
          posts: category.posts,
          postsPerPage: 15, //category.context.peek().postsPerPage,
          outputDir: category.outputPath,
          render: async ({ outputPath, pageOfPosts, paginationData }) => {
            const data = {
              ...contentModel,
              category,
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
            return models.post().render(renderer, post, { contentModel, settings, debug })
          })
        )
      }

      const renderAttachments = () => {
        return Promise.all(
          category.attachments.map(attachment => {
            return models.attachment().render(renderer, attachment)
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
