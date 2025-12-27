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

const LINKED_FIELD_SYNTAX = /^\+[^ ]+$/

const parseLink = (value) => {
  return value.replace(/^\+/g, '').split('/').filter(Boolean)
}

const findLinkedNode = (allNodes, linkPath) => {
  const leafSlug = linkPath.pop()
  const leafRe = new RegExp(`^${leafSlug}$`, 'i')
  const leafMatches = allNodes.filter(p => p.slug.match(leafRe))

  if (!leafMatches.length) {
    return undefined
  }

  if (leafMatches.length === 1) {
    return leafMatches[0]
  }

  if (!linkPath.length) {
    return undefined
  }

  const paths = linkPath.reverse()
  return leafMatches.find(node => {
    let ctx = node.context
    for (const path of paths) {
      ctx = ctx.throwUntil(item => {
        return item.slug?.match(new RegExp(`^${path}$`, 'i'))
      })
    }
    return !!ctx.items.length
  })
}

const linkNodes = (nodes) => {
  nodes.forEach(node => {
    const fields = Object.keys(node)
    Object.keys(node).forEach(key => {
      const value = node[key]
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          let valueItem = value[i]
          if (!LINKED_FIELD_SYNTAX.test(valueItem)) {
            break
          }
          const link = parseLink(valueItem)
          const linkedNode = findLinkedNode(nodes, link)
          if (linkedNode) {
            node[key][i] = Object.assign({}, linkedNode)
            linkBack(node, linkedNode, key)
          } else {
            node[key].splice(i, 1)
            i--
          }
        }
      } else {
        if (!LINKED_FIELD_SYNTAX.test(value)) {
          return
        }
        const link = parseLink(value)
        const linkedNode = findLinkedNode(nodes, link)
        if (linkedNode) {
          node[key] = Object.assign({}, linkedNode)
          linkBack(node, linkedNode, key)
        } else {
          node[key] = undefined
        }
      }
    })
  })
}

const linkBack = (post, entry, key) => {
  if (entry.schema) {
    Object.keys(entry.schema).forEach(schemaKey => {
      const schemaValue = entry.schema[schemaKey]
      const isSchemaValueArray = Array.isArray(schemaValue)
      const re = new RegExp(`^\\+(${post.contentType}|):${key}$`)
      const match = isSchemaValueArray ?
        schemaValue.find(v => re.test(v)) :
        re.test(schemaValue)
      if (match) {
        if (isSchemaValueArray) {
          // console.log('linking', post.title, 'to', schemaKey, 'field of', entry.title)
          entry[schemaKey] = entry[schemaKey] || []
          entry[schemaKey].push(post)
        } else {
          entry[schemaKey] = post
        }
      }
    })
    return
  }
  entry.links = entry.links || {}
  entry.links.relations = entry.links.relations || []
  const relation = entry.links.relations.find(r => r.key === key)
  if (relation) {
    relation.entries.push(post)
  } else {
    entry.links.relations.push({
      key,
      entries: [post]
    })
  }
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

  afterEffects() {
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

    linkNodes([
      ...this.subtree.subpages,
      ...this.subtree.collections,
      ...flatMapDeepCategories(this.subtree.collections),
      ..._.flatMap(this.subtree.collections, ({ subtree }) => subtree.posts)
    ])

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
