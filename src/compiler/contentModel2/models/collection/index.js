const { join, resolve } = require('path')
const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const { isTemplateFile, removeExtension, Markdown } = require('../../helpers')
const models = {
  attachment: require('../attachment'),
  category: require('./category'),
  post: require('./post'),
  tag: require('./tag')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

const defaultSettings = {
  defaultCategoryName: 'Unclassified',
  collectionAliases: []
}
module.exports = function Collection(settings = defaultSettings, contentTypes = []) {
  const indexFileNameOptions = [
    ...settings.collectionAliases,
    'collection'
  ].filter(Boolean)

  const isCollectionIndexFile = (node) => {
    return isTemplateFile(node) && node.name.match(
      new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
    )
  }

  return {
    match: node => node.children?.find(isCollectionIndexFile),

    create: (node, context) => {
      function collectPostTags(post) {
        post.tags.forEach(postTag => {
          let collectionTag = tree.tags.find(t => t.name === postTag.name)
          if (collectionTag) {
            collectionTag.posts.push(post)
          } else {
            collectionTag = {
              ...postTag,
              posts: [post]
            }
            tree.tags.push(collectionTag)
          }
        })
      }

      function linkPosts(post, postIndex, posts) {
        post.links = {}
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

      function addUncategorizedPost(childNode) {
        let defaultCategory = tree.categories.find(cat => cat.isDefaultCategory)
        if (!defaultCategory) {
          defaultCategory = childModels.category.create(
            { isDefaultCategory: true },
            context.push(collectionContext)
          )
          tree.categories.push(defaultCategory)
        }
        const defaultCategoryContext = _.omit(
          defaultCategory,
          ['posts', 'context', 'content', 'attachments']
        )
        const uncategorizedPost = childModels.post.create(
          childNode,
          context.push({
            ...collectionContext,
            key: 'collection'
          }).push({
            ...defaultCategoryContext,
            key: 'category'
          })
        )
        defaultCategory.levelPosts.push(uncategorizedPost)
        defaultCategory.posts.push(uncategorizedPost)
        defaultCategory.posts.forEach(linkPosts)
        tree.posts.push(uncategorizedPost)
      }

      const tree = {
        categories: [],
        posts: [],
        tags: [],
        attachments: []
      }

      const indexFile = node.children.find(isCollectionIndexFile)
      const indexProps = frontMatter(indexFile.content)
      const indexFileName = removeExtension(indexFile.name)

      const contentType = contentTypes
        .filter(ct => ct.model === 'collection')
        .find(ct => ct.collectionAlias === indexFileName)

      const slug = indexProps.attributes?.slug || makeSlug(node.name)
      const permalink = context.peek().permalink + slug
      const outputPath = join(context.peek().outputPath, slug)
      const collectionContext = {
        ...indexProps.attributes,
        contentType: indexProps.attributes?.contentType || contentType?.name || 'default',
        categoryContentType: indexProps.attributes?.categoryContentType || contentType?.categoryContentType || 'default',
        entryContentType: indexProps.attributes?.entryContentType || contentType?.entryContentType || 'default',
        categoryAlias: indexProps.attributes?.categoryAlias || contentType?.categoryAlias,
        categoriesAlias: indexProps.attributes?.categoriesAlias || contentType?.categoriesAlias,
        entryAlias: indexProps.attributes?.entryAlias || contentType?.entryAlias,
        entriesAlias: indexProps.attributes?.entriesAlias || contentType?.entriesAlias,
        defaultCategoryName: indexProps.attributes?.defaultCategoryName || contentType?.defaultCategoryName || settings.defaultCategoryName,
        title: indexProps.attributes?.title || node.name,
        slug,
        permalink,
        outputPath
      }

      const categoriesAlias = indexProps.attributes?.categoriesAlias || contentType?.categoriesAlias
      if (categoriesAlias) {
        tree[categoriesAlias] = tree.categories
      }

      const entriesAlias = indexProps.attributes?.entriesAlias || contentType?.entriesAlias
      if (entriesAlias) {
        tree[entriesAlias] = tree.posts
      }

      const childModels = {
        attachment: models.attachment(),
        category: models.category({
          categoryAlias: indexProps.attributes?.categoryAlias || contentType?.categoryAlias,
          entryAlias: indexProps.attributes?.entryAlias || contentType?.entryAlias
        }),
        post: models.post({
          entryAlias: indexProps.attributes?.entryAlias || contentType?.entryAlias
        })
      }

      node.children.forEach(childNode => {
        if (isCollectionIndexFile(childNode)) {
          return
        }
        if (childModels.post.match(childNode)) {
          return addUncategorizedPost(childNode)
        }
        if (childModels.category.match(childNode)) {
          const newCategory = childModels.category.create(
            childNode,
            context.push({
              ...collectionContext,
              key: 'collection'
            })
          )
          tree.categories.push(newCategory)
          tree.posts.push(...newCategory.posts)
          return
        }
        if (childModels.attachment.match(childNode)) {
          tree.attachments.push(
            childModels.attachment.create(
              childNode,
              context.push({
                ...collectionContext,
                key: 'collection'
              })
            )
          )
        }
      })

      tree.posts.sort((a, b) => b.date - a.date)
      tree.posts.forEach((post, i, posts) => {
        collectPostTags(post)
      })

      const contentRaw = indexProps.body || ''
      const content = indexFile ?
        parseContent(indexFile, contentRaw) :
        ''

      return {
        ...collectionContext,
        ...tree,
        context,
        contentRaw,
        content
      }
    },

    render: (renderer, collection, { contentModel, settings, debug }) => {
      const renderCollection = () => {
        return renderer.paginate({
          page: collection,
          posts: collection.posts,
          postsPerPage: 15, //collection.context.peek().postsPerPage,
          outputDir: collection.outputPath,
          render: async ({ outputPath, pageOfPosts, paginationData }) => {
            return renderer.render({
              templates: [
                `pages/${collection.template}`,
                `pages/collection/${collection.contentType}`,
                `pages/collection/default`
              ],
              outputPath,
              content: collection.content,
              data: {
                ...contentModel,
                collection,
                pagination: paginationData,
                posts: pageOfPosts,
                settings,
                debug
              }
            })
          }
        })
      }

      const renderAttachments = () => {
        return Promise.all(
          collection.attachments.map(attachment => {
            return models.attachment().render(renderer, attachment)
          })
        )
      }

      const renderCategories = () => {
        return Promise.all(
          collection.categories.map(category => {
            return models.category().render(
              renderer, category, { contentModel, settings, debug}
            )
          })
        )
      }

      const renderTags = () => {
        return models.tag().render(
          renderer, collection.tags, { contentModel, settings, debug }
        )
      }

      return Promise.all([
        renderCollection(),
        renderAttachments(),
        renderCategories(),
        renderTags()
      ])
    }
  }
}
