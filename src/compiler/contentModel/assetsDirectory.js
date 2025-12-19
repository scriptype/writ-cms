const ContentModelEntryNode = require('../../lib/ContentModelEntryNode')
const matcha = require('../../lib/matcha')

const models = {
  Asset: require('./asset')
}

const defaultSettings = {
  assetsDirectory: 'assets'
}
class AssetsDirectory extends ContentModelEntryNode {
  static serialize(assetsDirectory) {
    return {
      assets: assetsDirectory.subtree.assets.map(models.Asset.serialize)
    }
  }

  constructor(fsNode, context, settings) {
    super(fsNode, context, settings)
    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      assets: []
    })
  }

  getChildContext() {
    return this.context
  }

  getSubtreeConfig() {
    return [{
      key: 'assets',
      model: models.Asset,
      matcher: matcha.true(),
      settings: {
        assetsDirectory: this.settings.assetsDirectory
      }
    }]
  }
}

module.exports = AssetsDirectory
