const { resolve } = require('path')
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
  const [collectionSlug, ...restPath] = value.replace(/^\+/g, '').split('/')
  const entrySlug = restPath.pop()
  const categorySlugs = restPath
  return {
    collectionSlug,
    categorySlugs,
    entrySlug
  }
}

const findLinkedEntry = (contentModel, link) => {
  const collectionSlugRe = new RegExp(link.collectionSlug, 'i')
  const collection = contentModel.subtree.collections.find(c => c.slug.match(collectionSlugRe))
  let container = collection

  for (const categorySlug of link.categorySlugs) {
    const categorySlugRe = new RegExp(categorySlug, 'i')
    const category = container.subtree.categories?.find(c => c.slug.match(categorySlugRe))
    if (!category) {
      break
    }
    container = category
  }

  const entrySlugRe = new RegExp(link.entrySlug, 'i')
  const queue = [container]
  while (queue.length > 0) {
    const node = queue.shift()
    if (node.slug?.match(entrySlugRe)) {
      return node
    }
    const match = node.subtree.levelPosts?.find(p => p.slug.match(entrySlugRe))
    if (match) {
      return match
    }
    if (node.subtree.categories) {
      queue.push(...node.subtree.categories)
    }
  }

  return undefined
}

const linkBack = (post, entry, key) => {
  if (entry.schema) {
    Object.keys(entry.schema).forEach(schemaKey => {
      const schemaValue = entry.schema[schemaKey]
      const re = new RegExp(`^\\+(${post.contentType}|):${key}$`)
      const match = Array.isArray(schemaValue) ?
        schemaValue.find(v => re.test(v)) :
        re.test(schemaValue)
      if (match) {
        // console.log('linking', post.title, 'to', schemaKey, 'field of', entry.title)
        entry[schemaKey] = entry[schemaKey] || []
        entry[schemaKey].push(post)
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

const linkEntries = (contentModel) => {
  contentModel.subtree.collections.forEach(collection => {
    collection.subtree.posts.forEach(post => {
      const fields = Object.keys(post)
      Object.keys(post).forEach(key => {
        const value = post[key]
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            let valueItem = value[i]
            if (!LINKED_FIELD_SYNTAX.test(valueItem)) {
              break
            }
            const link = parseLink(valueItem)
            const entry = findLinkedEntry(contentModel, link)
            if (entry) {
              post[key][i] = Object.assign({}, entry)
              linkBack(post, entry, key)
            } else {
              post[key].splice(i, 1)
              i--
            }
          }
        } else {
          if (!LINKED_FIELD_SYNTAX.test(value)) {
            return
          }
          const link = parseLink(value)
          const entry = findLinkedEntry(contentModel, link)
          if (entry) {
            post[key] = Object.assign({}, entry)
            linkBack(post, entry, key)
          } else {
            post[key] = undefined
          }
        }
      })
    })
  })
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
    linkEntries(this)

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