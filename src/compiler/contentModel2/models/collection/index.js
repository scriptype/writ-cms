const { join } = require('path')
const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const Settings = require('../../../../settings')
const { isTemplateFile, Markdown } = require('../../helpers')
const models = {
  attachment: require('../attachment'),
  category: require('./category'),
  post: require('./post')
}

const isCollectionIndexFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^collection\..+$/)
}

const isPostIndexFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^(post|index)\..+$/)
}

const isPost = (node) => {
  return isTemplateFile(node) || node.children?.find(isPostIndexFile)
}

const isCategory = (node) => {
  return node.children?.find(isPost)
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

function collection(node) {
  const settings = Settings.getSettings()

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
      defaultCategory = models.category({ isDefaultCategory: true }, { collection: context })
      tree.categories.push(defaultCategory)
    }
    const uncategorizedPost = models.post(childNode, {
      collection: context,
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
  const permalink = settings.permalinkPrefix + slug
  const outputPath = join(settings.out, slug)
  const context = {
    ...indexProps.attributes,
    childContentType: indexProps.attributes?.childContentType || 'text',
    title: indexProps.attributes?.title || node.name,
    slug,
    permalink,
    outputPath
  }

  node.children.forEach(childNode => {
    if (isCollectionIndexFile(childNode)) {
      return
    }
    if (isPost(childNode)) {
      return addUncategorizedPost(childNode)
    }
    if (isCategory(childNode)) {
      const newCategory = models.category(childNode, { collection: context })
      tree.categories.push(newCategory)
      tree.posts.push(...newCategory.posts)
      return
    }
    tree.attachments.push(
      models.attachment(childNode, { collection: context })
    )
  })

  tree.posts.sort((a, b) => b.date - a.date)
  tree.posts.forEach((post, i, posts) => {
    collectPostTags(post)
  })

  const contentRaw = indexProps.content || ''
  const content = indexFile ?
    parseContent(indexFile, contentRaw) :
    ''

  return {
    ...context,
    ...tree,
    contentRaw,
    content
  }
}

module.exports = collection
