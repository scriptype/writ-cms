const { resolve } = require('path')
const _ = require('lodash')
const ImmutableStack = require('../../lib/ImmutableStack')
const { removeExtension } = require('../../lib/contentModelHelpers')
const ContentModelEntryNode = require('../../lib/ContentModelEntryNode')
const matcha = require('../../lib/matcha')

const models = {
  Homepage: require('./homepage'),
  PagesDirectory: require('./pagesDirectory'),
  Subpage: require('./subpage'),
  Collection: require('./collection'),
  AssetsDirectory: require('./assetsDirectory'),
  Asset: require('./asset')
}

const defaultSettings = {
  permalinkPrefix: '/',
  out: resolve('.'),
  defaultCategoryName: 'Unclassified',
  assetsDirectory: 'assets',
  pagesDirectory: 'pages',
  homepageDirectory: 'homepage',
  debug: false,
  site: {
    title: '',
    description: ''
  },
  mode: 'start'
}
class ContentModel extends ContentModelEntryNode {
  static serialize(contentModel) {
    return {
      ...contentModel,
      ...contentModel.serializeLinks(),
      homepage: models.Homepage.serialize(contentModel.subtree.homepage),
      subpages: contentModel.subtree.subpages.map(models.Subpage.serialize),
      collections: contentModel.subtree.collections.map(models.Collection.serialize),
      assets: contentModel.subtree.assets.map(models.Asset.serialize)
    }
  }

  static draftCheck(mode, node) {
    return mode === 'start' || !node.draft
  }

  constructor(fsNode, contentModelSettings, contentTypes) {
    const settings = {
      ...defaultSettings,
      ...contentModelSettings
    }

    const context = new ImmutableStack([{
      key: 'root',
      outputPath: settings.out,
      permalink: settings.permalinkPrefix
    }])

    super(fsNode, context, settings)

    this.contentTypes = contentTypes

    this.subtreeConfig = this.getSubtreeConfig()

    this.subtree = this.parseSubtree({
      homepage: new models.Homepage(
        { name: 'index', extension: 'md', content: '' },
        this.context,
        { homepageDirectory: this.settings.homepageDirectory }
      ),
      pagesDirectory: [],
      subpages: [],
      collections: [],
      assets: []
    })

    this.afterEffects()
  }

  getIndexFile() {
    return this.fsNode.children.find(
      matcha.templateFile({
        nameOptions: ['root']
      })
    )
  }

  getCollectionAliases() {
    const collectionAliasesFromContentTypes = this.contentTypes
      .filter(ct => ct.model === 'collection')
      .map(ct => ct.collectionAlias)

    const collectionAliasesFromFrontMatter = this.collectionAliases || []

    return [
      ...collectionAliasesFromContentTypes,
      ...collectionAliasesFromFrontMatter
    ]
  }

  getChildContext() {
    return this.context
  }

  getSubtreeConfig() {
    const collectionAliases = this.getCollectionAliases()

    return [{
      key: 'homepage',
      singular: true,
      model: models.Homepage,
      matcher: matcha.folderable({
        nameOptions: {
          folder: [this.settings.homepageDirectory, 'homepage', 'home'],
          index: ['index'],
          standalone: ['homepage', 'home', 'index']
        }
      }),
      settings: {
        homepageDirectory: this.settings.homepageDirectory
      }
    }, {
      key: 'subpages',
      model: models.Subpage,
      matcher: matcha.folderable({
        nameOptions: {
          index: ['page', 'index']
        }
      }),
      settings: {
        pagesDirectory: this.settings.pagesDirectory
      }
    }, {
      key: 'pagesDirectory',
      singular: true,
      model: models.PagesDirectory,
      matcher: matcha.directory({
        nameOptions: [this.settings.pagesDirectory, 'subpages', 'pages']
      }),
      settings: {
        pagesDirectory: this.settings.pagesDirectory,
        assetsDirectory: this.settings.assetsDirectory,
        debug: this.settings.debug
      },
      sideEffect: (tree, entry) => {
        tree.subpages.push(...entry.subtree.subpages)
        tree.assets.push(...entry.subtree.assets)
      }
    }, {
      key: 'collections',
      model: models.Collection,
      matcher: matcha.directory({
        children: matcha.either(
          matcha.templateFile({
            nameOptions: collectionAliases.concat('collection')
          }),
          matcha.dataFile({
            nameOptions: (fsNode) => ([fsNode.name])
          }),
        )
      }),
      settings: {
        defaultCategoryName: this.settings.defaultCategoryName,
        collectionAliases,
        mode: this.settings.mode,
        contentTypes: this.contentTypes,
        sortBy: 'date',
        sortOrder: -1
      }
    }, {
      key: 'assetsDirectory',
      singular: true,
      model: models.AssetsDirectory,
      matcher: matcha.directory({
        nameOptions: [this.settings.assetsDirectory, 'assets']
      }),
      settings: {
        assetsDirectory: this.settings.assetsDirectory
      },
      sideEffect: (tree, entry) => {
        tree.assets.push(...entry.subtree.assets)
      }
    }, {
      key: 'assets',
      model: models.Asset,
      matcher: matcha.true(),
      settings: {
        assetsDirectory: this.settings.assetsDirectory
      }
    }]
  }

  linkNodes() {
    const flatMapDeepCategories = (container) => {
      return _.flatMapDeep(container, ({ subtree }) => {
        if (subtree.categories.length) {
          return [
            subtree.categories,
            flatMapDeepCategories(subtree.categories)
          ]
        }
        return []
      })
    }

    const nodes = [
      ...this.subtree.assets,
      ...this.subtree.subpages,
      ...this.subtree.collections,
      ...flatMapDeepCategories(this.subtree.collections),
      ..._.flatMapDeep(this.subtree.collections, ({ subtree }) => {
        return subtree.posts.map(post => [post, post.subtree.attachments])
      })
    ]

    nodes.forEach(node => node.resolveLinks(nodes))
  }

  afterEffects() {
    this.linkNodes()

    this.subtree.collections.forEach(collection => {
      collection.afterEffects(this.subtree)
    })

    this.subtree.subpages.forEach(subpage => {
      subpage.afterEffects(this.subtree)
    })

    this.subtree.homepage.afterEffects(this.subtree)

    this.subtree.assets.forEach(asset => {
      asset.afterEffects(this.subtree)
    })
  }

  render(renderer) {
    const renderHomepage = () => {
      return this.subtree.homepage.render(renderer, {
        contentModel: ContentModel.serialize(this),
        settings: this.settings,
        debug: this.settings.debug
      })
    }

    const renderCollections = () => {
      return Promise.all(
        this.subtree.collections.map(collection => {
          return collection.render(renderer, {
            contentModel: ContentModel.serialize(this),
            settings: this.settings,
            debug: this.settings.debug
          })
        })
      )
    }

    const renderSubpages = () => {
      return Promise.all(
        this.subtree.subpages.map(subpage => {
          return subpage.render(renderer, {
            contentModel: ContentModel.serialize(this),
            settings: this.settings,
            debug: this.settings.debug
          })
        })
      )
    }

    const renderAssets = () => {
      return Promise.all(
        this.subtree.assets.map(asset => {
          return asset.render(renderer)
        })
      )
    }

    return renderHomepage()
      .then(() =>
        Promise.all([
          renderCollections(),
          renderSubpages(),
          renderAssets()
        ])
      )
  }
}

module.exports = ContentModel
