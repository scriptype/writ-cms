const { join } = require('path')

function attachment(node, context) {
  const permalink = [
    context.page?.permalink ||
    context.post?.permalink ||
    context.category?.permalink ||
    context.collection?.permalink,
    node.name
  ].filter(Boolean).join('/')

  const outputPath = join(...[
    context.page?.outputPath ||
    context.post?.outputPath ||
    context.category?.outputPath ||
    context.collection?.outputPath,
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
