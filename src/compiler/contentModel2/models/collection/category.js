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

  if (node.isDefaultCategory) {
    const slug = makeSlug(settings.defaultCategoryName)
    const permalink = (
      settings.permalinkPrefix +
      context.collection.slug
    )
    const outputPath = join(
      settings.out,
      context.collection.slug,
      'index.html'
    )
    return {
      context,
      childContentType: context.collection.childContentType,
      content: '',
      contentRaw: '',
      title: settings.defaultCategoryName,
      slug,
      permalink,
      outputPath,
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
  const permalink = (
    settings.permalinkPrefix +
    [ context.collection.slug, slug ].join('/')
  )
  const outputPath = join(
    settings.out,
    context.collection.slug, slug, 'index.html'
  )

  const categoryContext = {
    ...indexProps.attributes,
    childContentType: indexProps.attributes?.childContentType || context.collection.childContentType,
    title: indexProps.attributes?.title || node.name,
    slug,
    permalink
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

  const contentRaw = indexProps.content || ''
  const content = indexFile ?
    parseContent(indexFile, contentRaw) :
    ''

  return {
    ...categoryContext,
    ...tree,
    context: context,
    contentRaw,
    content,
    outputPath
  }
}

module.exports = category
