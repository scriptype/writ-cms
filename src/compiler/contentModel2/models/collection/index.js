const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const settings = require('../../../../settings').getSettings()
const { isTemplateFile } = require('../../helpers')
const models = {
  attachment: require('../attachment'),
  category: require('./category'),
  post: require('./post')
}

function collection(node) {
  function collectPostTags(post) {
    post.tags.forEach(postTag => {
      let collectionTag = tree.tags.find(t => t.name === postTag.name)
      if (collectionTag) {
        collectionTag.posts.push(post)
      } else {
        collectionTag = {
          name: postTag.name,
          posts: [post]
        }
        tree.tags.push(collectionTag)
      }
    })
  }

  function attachLinks(post, postIndex, posts) {
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
      defaultCategory = models.category({ isDefaultCategory: true }, { collection: context })
      tree.categories.push(defaultCategory)
    }
    const uncategorizedPost = models.post(childNode, {
      collection: context,
      category: _.omit(defaultCategory, ['posts', 'context', 'content', 'attachments'])
    })
    defaultCategory.posts.push(uncategorizedPost)
    tree.posts.push(uncategorizedPost)
  }

  const tree = {
    categories: [],
    posts: [],
    tags: [],
    attachments: []
  }

  const indexFile = node.children.find(child => {
    return isTemplateFile(child) && child.name.match(/^collection\..+$/)
  })

  const indexProps = indexFile ? frontMatter(indexFile.content) : {}

  const slug = indexProps.attributes?.slug || makeSlug(node.name)
  const context = {
    ...indexProps.attributes,
    childContentType: indexProps.attributes?.childContentType || 'text',
    title: indexProps.attributes?.title || node.name,
    slug,
    permalink: settings.permalinkPrefix + slug
  }

  node.children.forEach(childNode => {
    if (!childNode.children) {
      if (isTemplateFile(childNode)) {
        if (childNode.name.match(/^collection\..+$/)) {
          return
        }
        return addUncategorizedPost(childNode)
      }
      return tree.attachments.push(
        models.attachment(childNode, { collection: context })
      )
    }
    if (childNode.children.find(c => isTemplateFile(c) && c.name.match(/^post\..+$/))) {
      return addUncategorizedPost(childNode)
    }
    const newCategory = models.category(childNode, { collection: context })
    tree.categories.push(newCategory)
    tree.posts.push(...newCategory.posts)
  })

  tree.posts.sort((a, b) => b.date - a.date)
  tree.posts.forEach((post, i, posts) => {
    collectPostTags(post)
    attachLinks(post, i, posts)
  })

  return {
    ...context,
    ...tree,
    content: indexProps.content || ''
  }
}

module.exports = collection
