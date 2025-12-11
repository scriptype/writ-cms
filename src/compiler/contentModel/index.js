const { resolve } = require('path')
const _ = require('lodash')
const frontMatter = require('front-matter')
const ImmutableStack = require('../../lib/ImmutableStack')
const { removeExtension, isTemplateFile } = require('../../lib/contentModelHelpers')
const ContentModelEntryNode = require('../../lib/ContentModelEntryNode')
const matcha = require('../../lib/matcha')

const models = {
  Homepage: require('./models/homepage'),
  Subpage: require('./models/subpage'),
  Collection: require('./models/collection'),
  Asset: require('./models/asset')
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

    const collectionAliasesFromContentTypes = contentTypes
      .filter(ct => ct.model === 'collection')
      .map(ct => ct.collectionAlias)

    const collectionAliasesFromFrontMatter = this.collectionAliases || []

    this.collectionAliases = [
      ...collectionAliasesFromContentTypes,
      ...collectionAliasesFromFrontMatter
    ]

    this.matchers = this.getSubtreeMatchers()
    this.subtree = this.parseSubtree()
    this.afterEffects()
  }

  getIndexFile() {
    return this.fsNode.find(
      matcha.templateFile({
        nameOptions: ['root']
      })
    )
  }

  getSubtreeMatchers() {
    return {
      collectionIndexFile: matcha.templateFile({
        nameOptions: this.collectionAliases.concat('collection')
      }),

      collection: matcha.directory({
        children: matcha.either(
          matcha.templateFile({
            nameOptions: this.collectionAliases.concat('collection')
          }),
          matcha.dataFile({
            nameOptions: (fsNode) => ([fsNode.name])
          }),
        )
      }),

      homepage: matcha.folderable({
        nameOptions: {
          folder: [this.settings.homepageDirectory, 'homepage', 'home'],
          index: ['index'],
          standalone: ['homepage', 'home', 'index']
        }
      }),

      subpage: matcha.folderable({
        nameOptions: {
          index: ['page', 'index']
        }
      }),

      pagesDirectory: matcha.directory({
        nameOptions: [this.settings.pagesDirectory, 'subpages', 'pages']
      }),

      asset: matcha.true(),

      assetsDirectory: matcha.directory({
        nameOptions: [this.settings.assetsDirectory, 'assets']
      })
    }
  }

  parseSubtree() {
    const tree = {
      homepage: new models.Homepage(
        { name: 'index', extension: 'md', content: '' },
        this.context,
        { homepageDirectory: this.settings.homepageDirectory }
      ),
      subpages: [],
      collections: [],
      assets: []
    }

    this.fsNode.forEach(node => {
      if (node === this.indexFile) {
        return
      }

      if (this.matchers.homepage(node)) {
        tree.homepage = new models.Homepage(node, this.context, {
          homepageDirectory: this.settings.homepageDirectory
        })
        return
      }

      if (this.matchers.subpage(node)) {
        return tree.subpages.push(
          new models.Subpage(node, this.context, {
            pagesDirectory: this.settings.pagesDirectory
          })
        )
      }

      if (this.matchers.pagesDirectory(node)) {
        return node.children.forEach(childNode => {
          if (this.matchers.subpage(childNode)) {
            tree.subpages.push(
              new models.Subpage(childNode, this.context, {
                pagesDirectory: this.settings.pagesDirectory
              })
            )
          } else if (this.matchers.asset(childNode)) {
            tree.assets.push(
              new models.Asset(childNode, this.context, {
                assetsDirectory: this.settings.assetsDirectory
              })
            )
          }
        })
      }

      if (this.matchers.collection(node)) {
        const indexFile = node.children.find(this.matchers.collectionIndexFile)

        const contentType = this.contentTypes
          .filter(ct => ct.model === 'collection')
          .find(ct => {
            return ct.collectionAlias === (indexFile ? removeExtension(indexFile.name) : node.name)
          })

        const collection = new models.Collection(node, this.context, {
          defaultCategoryName: this.settings.defaultCategoryName,
          collectionAliases: this.collectionAliases,
          mode: this.settings.mode,
          contentTypes: this.contentTypes,
          sortBy: 'date',
          sortOrder: -1,
          contentType
        })

        if (ContentModel.draftCheck(this.settings.mode, collection)) {
          tree.collections.push(collection)
        }
        return
      }

      if (this.matchers.assetsDirectory(node)) {
        return tree.assets.push(
          ...node.children.map(childNode => {
            return new models.Asset(childNode, this.context, {
              assetsDirectory: this.settings.assetsDirectory
            })
          })
        )
      }

      if (this.matchers.asset(node)) {
        return tree.assets.push(
          new models.Asset(node, this.context, {
            assetsDirectory: this.settings.assetsDirectory
          })
        )
      }
    })
    return tree
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
