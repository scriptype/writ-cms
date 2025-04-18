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

const linkEntries = (contentModel) => {
  contentModel.collections.forEach(collection => {
    collection.posts.forEach(post => {
      const fields = Object.keys(post)
      const linkFields = fields
        .map(key => {
          const match = key.match(/(.+){(.+)}/)
          if (!match) {
            return
          }
          const [, entrySlug, categorySlug] = post[key].match(/([^(\s]+)(?:\s*\(([^)]+)\))?/)
          return {
            key: match[1],
            collectionSlug: match[2],
            categorySlug,
            entrySlug
          }
        })
        .filter(Boolean)
      linkFields.forEach(link => {
        const collection = contentModel.collections.find(c => c.slug.match(new RegExp(link.collectionSlug, 'i')))
        const container = link.categorySlug ?
          collection.categories.find(c => c.slug.match(new RegExp(link.categorySlug, 'i'))) || collection :
          collection
        const entry = container.posts.find(p => p.slug.match(new RegExp(link.entrySlug, 'i')))
        post[link.key] = entry
        entry.links = entry.links || {}
        entry.links.relations = entry.links.relations || []
        const relation = entry.links.relations.find(r => r.key === link.key)
        if (relation) {
          relation.entries.push(post)
        } else {
          entry.links.relations.push({
            key: link.key,
            entries: [post]
          })
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
  }
}
class ContentModel {
  constructor(contentModelSettings = defaultContentModelSettings, contentTypes = []) {
    this.settings = {
      ...defaultContentModelSettings,
      ...contentModelSettings
    }
    this.contentTypes = contentTypes
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
        ]
      }, this.contentTypes),

      subpage: models.subpage({
        pagesDirectory: this.settings.pagesDirectory
      }),

      homepage: models.homepage({
        homepageDirectory: this.settings.homepageDirectory
      }),

      asset: models.asset({
        assetsDirectory: this.settings.assetsDirectory
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
        return this.contentModel.collections.push(
          this.models.collection.create(node, context)
        )
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

    linkEntries(this.contentModel)
    return this.contentModel
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
