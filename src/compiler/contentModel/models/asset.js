const { join } = require('path')
const { makePermalink } = require('../../../lib/contentModelHelpers')
const ContentModelResourceNode = require('../../../lib/ContentModelResourceNode')

const defaultSettings = {
  assetsDirectory: 'assets'
}
class Asset extends ContentModelResourceNode {
  static serialize(asset) {
    return asset
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.subtree = this.parseSubtree()
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
