const settings = require('../../../settings').getSettings()

function attachment(node, context) {
  const permalink = (
    settings.permalinkPrefix +
    [
      context.collection?.slug,
      context.category?.isDefaultCategory ? '' : context.category.slug,
      context.post?.slug,
      context.page?.slug,
      node.name
    ].filter(Boolean).join('/')
  )

  return {
    ...node,
    context,
    permalink,
    date: new Date(node.stats.birthtime || Date.now())
  }
}

module.exports = attachment
