const { join } = require('path')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const Settings = require('../../../../settings')
const { isTemplateFile, Markdown } = require('../../helpers')
const models = {
  post: require('./post'),
  attachment: require('../attachment')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

function category(node, context) {
  const settings = Settings.getSettings()

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

  if (node.isDefaultCategory) {
    return {
      context,
      childContentType: context.collection.childContentType,
      content: '',
      contentRaw: '',
      slug: '',
      title: settings.defaultCategoryName,
      permalink: context.collection.permalink,
      outputPath: context.collection.outputPath,
      isDefaultCategory: true,
      posts: [],
      attachments: []
    }
  }

  const indexFile = node.children.find(child => {
    return isTemplateFile(child) && child.name.match(/^category\..+$/)
  })
  const indexProps = indexFile ? frontMatter(indexFile) : {}

  const slug = indexProps.attributes?.slug || makeSlug(node.name)
  const permalink = [context.collection.permalink, slug].join('/')
  const outputPath = join(context.collection.outputPath, slug)

  const categoryContext = {
    ...indexProps.attributes,
    childContentType: indexProps.attributes?.childContentType || context.collection.childContentType,
    title: indexProps.attributes?.title || node.name,
    slug,
    permalink,
    outputPath,
  }

  const tree = {
    posts: [],
    attachments: []
  }

  node.children.forEach(childNode => {
    if (!childNode.children) {
      if (isTemplateFile(childNode)) {
        if (childNode.name.match(/^category\..+$/)) {
          return
        }
        return tree.posts.push(
          models.post(childNode, {
            ...context,
            category: categoryContext
          })
        )
      }
      return tree.attachments.push(
        models.attachment(childNode, {
          ...context,
          category: categoryContext
        })
      )
    }
    if (childNode.children.some(c => isTemplateFile(c) && c.name.match(/^(index|post)\..+$/))) {
      return tree.posts.push(
        models.post(childNode, {
          ...context,
          category: categoryContext
        })
      )
    }
    return tree.push(
      models.attachment(childNode, {
        ...context,
        category: categoryContext
      })
    )
  })

  tree.posts.sort((a, b) => b.date - a.date)
  tree.posts.forEach(linkPosts)

  const contentRaw = indexProps.content || ''
  const content = indexFile ?
    parseContent(indexFile, contentRaw) :
    ''

  return {
    ...categoryContext,
    ...tree,
    context: context,
    contentRaw,
    content
  }
}

module.exports = category
