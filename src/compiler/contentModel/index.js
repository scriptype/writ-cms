const { resolve } = require('path')
const _ = require('lodash')
const frontMatter = require('front-matter')
const ImmutableStack = require('../../lib/ImmutableStack')
const { isTemplateFile } = require('./helpers')
const models = {
  homepage: require('./models/homepage'),
  subpage: require('./models/subpage'),
  collection: require('./models/collection'),
  asset: require('./models/asset')
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
  const collection = contentModel.collections.find(c => c.slug.match(collectionSlugRe))
  let container = collection

  for (const categorySlug of link.categorySlugs) {
    const categorySlugRe = new RegExp(categorySlug, 'i')
    const category = container.categories?.find(c => c.slug.match(categorySlugRe))
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
    const match = node.levelPosts?.find(p => p.slug.match(entrySlugRe))
    if (match) {
      return match
    }
    if (node.categories) {
      queue.push(...node.categories)
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
  contentModel.collections.forEach(collection => {
    collection.posts.forEach(post => {
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

const defaultContentModelSettings = {
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
class ContentModel {
  constructor(contentModelSettings = defaultContentModelSettings, contentTypes = []) {
    this.settings = {
      ...defaultContentModelSettings,
      ...contentModelSettings
    }
    this.contentTypes = contentTypes
  }

  draftCheck(node) {
    return this.settings.mode === 'start' || !node.draft
  }

  create(fileSystemTree) {
    const indexFileNameOptions = ['root']

    const isRootIndexFile = (node) => {
      return isTemplateFile(node) && node.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
      )
    }

    const indexFile = fileSystemTree.find(isRootIndexFile)
    const indexProps = indexFile ? frontMatter(indexFile.content) : {}

    const context = new ImmutableStack([{
      key: 'root',
      outputPath: this.settings.out,
      permalink: this.settings.permalinkPrefix
    }])

    this.models = {
      collection: models.collection({
        defaultCategoryName: this.settings.defaultCategoryName,
        collectionAliases: [
          ...this.contentTypes
            .filter(ct => ct.model === 'collection')
            .map(ct => ct.collectionAlias),
          ...(indexProps.attributes?.collectionAliases || [])
        ],
        mode: this.settings.mode
      }, this.contentTypes),

      subpage: models.subpage({
        pagesDirectory: this.settings.pagesDirectory,
        mode: this.settings.mode
      }),

      homepage: models.homepage({
        homepageDirectory: this.settings.homepageDirectory,
        mode: this.settings.mode
      }),

      asset: models.asset({
        assetsDirectory: this.settings.assetsDirectory,
        mode: this.settings.mode
      })
    }

    this.contentModel = {
      homepage: this.models.homepage.create({
        name: 'index',
        extension: 'md',
        content: ''
      }, context),
      subpages: [],
      collections: [],
      assets: []
    }

    fileSystemTree.forEach(node => {
      if (this.models.homepage.match(node)) {
        this.contentModel.homepage = this.models.homepage.create(node, context)
        return
      }

      if (this.models.subpage.match(node)) {
        return this.contentModel.subpages.push(
          this.models.subpage.create(node, context)
        )
      }

      if (this.models.subpage.matchPagesDirectory(node)) {
        return node.children.forEach(childNode => {
          if (this.models.subpage.match(childNode)) {
            this.contentModel.subpages.push(
              this.models.subpage.create(childNode, context)
            )
          } else if (this.models.asset.match(childNode)) {
            this.contentModel.assets.push(
              this.models.asset.create(childNode, context)
            )
          }
        })
      }

      if (this.models.collection.match(node)) {
        const collection = this.models.collection.create(node, context)
        if (this.draftCheck(collection)) {
          this.contentModel.collections.push(collection)
        }
        return
      }

      if (this.models.asset.matchAssetsDirectory(node)) {
        return this.contentModel.assets.push(
          ...node.children.map(childNode => {
            return this.models.asset.create(childNode, context)
          })
        )
      }

      if (this.models.asset.match(node)) {
        return this.contentModel.assets.push(
          this.models.asset.create(node, context)
        )
      }
    })

    this.afterEffects()
    return this.contentModel
  }

  afterEffects() {
    linkEntries(this.contentModel)

    this.contentModel.collections.forEach(collection => {
      this.models.collection.afterEffects(this.contentModel, collection)
    })

    this.contentModel.subpages.forEach(subpage => {
      this.models.subpage.afterEffects(this.contentModel, subpage)
    })

    this.models.homepage.afterEffects(this.contentModel, this.contentModel.homepage)

    this.contentModel.assets.forEach(asset => {
      this.models.asset.afterEffects(this.contentModel, asset)
    })
  }

  render(renderer) {
    const renderHomepage = () => {
      return this.models.homepage.render(renderer, this.contentModel.homepage, {
        contentModel: this.contentModel,
        settings: this.settings,
        debug: this.settings.debug
      })
    }

    const renderCollections = () => {
      return Promise.all(
        this.contentModel.collections.map(collection => {
          return this.models.collection.render( renderer, collection, {
            contentModel: this.contentModel,
            settings: this.settings,
            debug: this.settings.debug
          })
        })
      )
    }

    const renderSubpages = () => {
      return Promise.all(
        this.contentModel.subpages.map(subpage => {
          return this.models.subpage.render(renderer, subpage, {
            contentModel: this.contentModel,
            settings: this.settings,
            debug: this.settings.debug
          })
        })
      )
    }

    const renderAssets = () => {
      return Promise.all(
        this.contentModel.assets.map(asset => {
          return this.models.asset.render(renderer, asset, {
            contentModel: this.contentModel,
            settings: this.settings,
            debug: this.settings.debug
          })
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
