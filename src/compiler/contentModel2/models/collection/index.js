const { join, resolve } = require('path')
const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const { isTemplateFile, Markdown } = require('../../helpers')
const models = {
  attachment: require('../attachment'),
  category: require('./category'),
  post: require('./post')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

const defaultSettings = {
  defaultCategoryName: 'Unclassified'
}
module.exports = function collection(settings = defaultSettings) {
  const isCollectionIndexFile = (node) => {
    return isTemplateFile(node) && node.name.match(/^collection\..+$/)
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
            { ...context, collection: collectionContext }
          )
          tree.categories.push(defaultCategory)
        }
        const uncategorizedPost = childModels.post.create(childNode, {
          ...context,
          collection: collectionContext,
          category: _.omit(defaultCategory, ['posts', 'context', 'content', 'attachments'])
        })
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
      const indexProps = indexFile ? frontMatter(indexFile.content) : {}

      const slug = indexProps.attributes?.slug || makeSlug(node.name)
      const permalink = context.root.permalink + slug
      const outputPath = join(context.root.outputPath, slug)
      const collectionContext = {
        ...indexProps.attributes,
        contentType: indexProps.attributes?.contentType || 'default',
        categoryContentType: indexProps.attributes?.categoryContentType || 'default',
        entryContentType: indexProps.attributes?.entryContentType || 'default',
        categoryAlias: indexProps.attributes?.categoryAlias,
        categoriesAlias: indexProps.attributes?.categoriesAlias,
        entryAlias: indexProps.attributes?.entryAlias,
        entriesAlias: indexProps.attributes?.entriesAlias,
        defaultCategoryName: indexProps.attributes?.defaultCategoryName || settings.defaultCategoryName,
        title: indexProps.attributes?.title || node.name,
        slug,
        permalink,
        outputPath
      }

      const categoriesAlias = indexProps.attributes?.categoriesAlias
      if (categoriesAlias) {
        tree[categoriesAlias] = tree.categories
      }

      const entriesAlias = indexProps.attributes?.entriesAlias
      if (entriesAlias) {
        tree[entriesAlias] = tree.posts
      }

      const childModels = {
        attachment: models.attachment(),
        category: models.category({
          categoryAlias: indexProps.attributes?.categoryAlias,
          entryAlias: indexProps.attributes?.entryAlias
        }),
        post: models.post({
          entryAlias: indexProps.attributes?.entryAlias
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
          const newCategory = childModels.category.create(childNode, {
            ...context,
            collection: collectionContext
          })
          tree.categories.push(newCategory)
          tree.posts.push(...newCategory.posts)
          return
        }
        if (childModels.attachment.match(childNode)) {
          tree.attachments.push(
            childModels.attachment.create(childNode, {
              ...context,
              collection: collectionContext
            })
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
    }
  }
}
