const frontMatter = require('front-matter')
const makeSlug = require('slug')
const settings = require('../../../../settings').getSettings()
const { isTemplateFile } = require('../../helpers')
const models = {
  post: require('./post'),
  attachment: require('../attachment')
}

function category(node, context) {
  if (node.isDefaultCategory) {
    const slug = makeSlug(settings.defaultCategoryName)
    return {
      context,
      childContentType: context.collection.childContentType,
      content: '',
      title: settings.defaultCategoryName,
      slug,
      permalink: (
        settings.permalinkPrefix +
        [ context.collection.slug, slug ].join('/')
      ),
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
  const categoryContext = {
    ...indexProps.attributes,
    childContentType: indexProps.attributes?.childContentType || context.collection.childContentType,
    title: indexProps.attributes?.title || node.name,
    slug,
    permalink: (
      settings.permalinkPrefix +
      [ context.collection.slug, slug ].join('/')
    )
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

  return {
    ...categoryContext,
    ...tree,
    context: context,
    content: indexProps.content || ''
  }
}

module.exports = category
