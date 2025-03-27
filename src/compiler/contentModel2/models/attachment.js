const { join } = require('path')
const Settings = require('../../../settings')

function attachment(node, context) {
  const settings = Settings.getSettings()

  const permalink = (
    settings.permalinkPrefix +
    [
      context.collection?.slug,
      context.category?.isDefaultCategory ? '' : context.category?.slug,
      context.post?.slug,
      context.page?.slug,
      node.name
    ].filter(Boolean).join('/')
  )

  const outputPath = join(...[
    settings.out,
    context.collection?.slug,
    context.category?.isDefaultCategory ? '' : context.category?.slug,
    context.post?.slug,
    context.page?.slug,
    node.name
  ].filter(Boolean))

  return {
    ...node,
    context,
    permalink,
    outputPath,
    date: new Date(node.stats.birthtime || Date.now())
  }
}

module.exports = attachment
