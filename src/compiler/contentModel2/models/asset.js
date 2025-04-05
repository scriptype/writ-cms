const { join, resolve } = require('path')

const defaultSettings = {
  permalinkPrefix: '/',
  out: resolve('.'),
  assetsDirectory: 'assets'
}
function asset(node, settings = defaultSettings) {
  const permalink = (
    settings.permalinkPrefix +
    [settings.assetsDirectory, node.name].join('/')
  )

  const outputPath = join(
    settings.out,
    settings.assetsDirectory,
    node.name
  )

  return {
    ...node,
    permalink,
    outputPath,
    date: new Date(node.stats.birthtime || Date.now())
  }
}

module.exports = asset
