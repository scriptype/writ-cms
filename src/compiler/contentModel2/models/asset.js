const { join } = require('path')
const Settings = require('../../../settings')

function asset(node) {
  const settings = Settings.getSettings()

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
