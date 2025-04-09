const { join, resolve } = require('path')

const defaultSettings = {
  assetsDirectory: 'assets'
}
module.exports = function asset(settings = defaultSettings) {
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
      const permalink = (
        context.root.permalink +
        [settings.assetsDirectory, node.name].join('/')
      )

      const outputPath = join(
        context.root.outputPath,
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
    }
  }
}
