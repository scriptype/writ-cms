const { join, resolve } = require('path')
const { makePermalink } = require('../helpers')

const defaultSettings = {
  assetsDirectory: 'assets',
  mode: 'start'
}
module.exports = function Asset(settings = defaultSettings) {
  const assetsDirectoryNameOptions = [settings.assetsDirectory, 'assets']

  const isAssetsDirectory = (node) => {
    return (
      node.children &&
      node.name.match(
        new RegExp(`^(${assetsDirectoryNameOptions.join('|')})$`)
      )
    )
  }

  return {
    match: node => true,
    matchAssetsDirectory: isAssetsDirectory,

    create: (node, context) => {
      const permalink = makePermalink(
        context.peek().permalink,
        settings.assetsDirectory,
        node.name
      )

      const outputPath = join(
        context.peek().outputPath,
        settings.assetsDirectory,
        node.name
      )

      return {
        ...node,
        context,
        permalink,
        outputPath,
        date: new Date(node.stats.birthtime || Date.now())
      }
    },

    afterEffects: (contentModel, asset) => {},

    render: (renderer, asset) => {
      return renderer.copy({
        src: asset.absolutePath,
        dest: asset.outputPath,
        recursive: !!asset.children
      })
    }
  }
}
