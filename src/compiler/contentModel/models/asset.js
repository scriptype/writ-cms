const { join } = require('path')
const { makePermalink } = require('../../../lib/contentModelHelpers')
const ContentModelNode = require('../../../lib/ContentModelNode')

const defaultSettings = {
  assetsDirectory: 'assets'
}
class Asset extends ContentModelNode {
  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
  }

  getPermalink() {
    return makePermalink(
      this.context.peek().permalink,
      this.settings.assetsDirectory,
      this.fsNode.name
    )
  }

  getOutputPath() {
    return join(
      this.context.peek().outputPath,
      this.settings.assetsDirectory,
      this.fsNode.name
    )
  }

  render(renderer) {
    return renderer.copy({
      src: this.fsNode.absolutePath,
      dest: this.outputPath,
      recursive: !!this.fsNode.children
    })
  }
}

module.exports = Asset
