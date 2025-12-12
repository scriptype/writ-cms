const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const matcha = require('../../../lib/matcha')

const models = {
  Subpage: require('./subpage'),
  Asset: require('./asset')
}

const defaultSettings = {
  pagesDirectory: 'pages',
  assetsDirectory: 'assets',
  mode: 'start',
  debug: false
}
class PagesDirectory extends ContentModelEntryNode {
  static serialize(pagesDirectory) {
    return {
      subpages: pagesDirectory.subtree.subpages.map(models.Subpage.serialize),
      assets: pagesDirectory.subtree.assets.map(models.Asset.serialize)
    }
  }

  constructor(fsNode, context, settings) {
    super(fsNode, context, settings)
    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      subpages: [],
      assets: []
    })
  }

  getChildContext() {
    return this.context
  }

  getSubtreeConfig() {
    return [{
      key: 'subpages',
      model: models.Subpage,
      settings: {
        pagesDirectory: this.settings.pagesDirectory
      },
      matcher: matcha.folderable({
        nameOptions: {
          index: ['page', 'index']
        }
      })
    }, {
      key: 'assets',
      model: models.Asset,
      settings: {
        assetsDirectory: this.settings.assetsDirectory
      },
      matcher: matcha.true()
    }]
  }
}

module.exports = PagesDirectory
