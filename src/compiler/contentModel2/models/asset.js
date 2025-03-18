const { join } = require('path')
const settings = require('../../../settings').getSettings()

function asset(node) {
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
    outputPath
  }
}

module.exports = asset
