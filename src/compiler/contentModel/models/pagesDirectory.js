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
    this.matchers = this.getSubtreeMatchers()
    this.subtree = this.parseSubtree()
    this.afterEffects()
  }

  getSubtreeMatchers() {
    return {
      subpage: matcha.folderable({
        nameOptions: {
          index: ['page', 'index']
        }
      }),

      asset: matcha.true()
    }
  }

  parseSubtree() {
    const tree = {
      subpages: [],
      assets: []
    }

    this.fsNode.children.forEach(childNode => {
      if (this.matchers.subpage(childNode)) {
        return tree.subpages.push(
          new models.Subpage(childNode, this.context, {
            pagesDirectory: this.settings.pagesDirectory
          })
        )
      }
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

module.exports = PagesDirectory
