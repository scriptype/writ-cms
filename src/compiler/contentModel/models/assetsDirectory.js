const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const matcha = require('../../../lib/matcha')

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
    this.matchers = this.getSubtreeMatchers()
    this.subtree = this.parseSubtree()
    this.afterEffects()
  }

  getSubtreeMatchers() {
    return {
      asset: matcha.true()
    }
  }

  parseSubtree() {
    const tree = {
      assets: []
    }

    this.fsNode.children.forEach(childNode => {
      if (this.matchers.asset(childNode)) {
        return tree.assets.push(
          new models.Asset(childNode, this.context, {
            assetsDirectory: this.settings.assetsDirectory
          })
        )
      }
    })
    return tree
  }
}

module.exports = AssetsDirectory
