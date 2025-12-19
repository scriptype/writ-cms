const { join, resolve } = require('path')
const makeSlug = require('slug')
const _ = require('lodash')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const {
  removeExtension,
  isTemplateFile,
  makePermalink,
  safeStringify,
  sort
} = require('../../../lib/contentModelHelpers')

const matcha = require('../../../lib/matcha')

const models = {
  Attachment: require('../attachment'),
  Category: require('./category'),
  Post: require('./post'),
  facet: require('./facet')
}

const defaultSettings = {
  defaultCategoryName: '',
  collectionAliases: [],
  mode: 'start'
}
class Collection extends ContentModelEntryNode {
  static locatePinnedEntries(entries) {
    const pinnedEntries = []

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      if (entry.order !== undefined) {
        entries.splice(i, 1)
        pinnedEntries.push(entry)
        i--
      }
    }

    pinnedEntries.sort((a, b) => a.order - b.order)

    for (const pinnedEntry of pinnedEntries) {
      const insertIndex = pinnedEntry.order === -1 ?
        entries.length :
        pinnedEntry.order
      entries.splice(insertIndex, 0, pinnedEntry)
    }
  }

  static serialize(collection) {
    const data = {
      ...collection,
      facets: collection.facets.map(models.facet().serialize),
      categories: collection.subtree.categories.map(models.Category.serialize),
      posts: collection.subtree.posts.map(models.Post.serialize),
      levelPosts: collection.subtree.levelPosts.map(models.Post.serialize),
      attachments: collection.subtree.attachments.map(models.Attachment.serialize)
    }

    // Alias for posts key in collection
    const entriesAlias = collection.entriesAlias || collection.schema?.entriesAlias
    if (entriesAlias) {
      data[entriesAlias] = data.posts
    }

    // Alias for categories key in collection
    const categoriesAlias = collection.categoriesAlias || collection.schema?.categoriesAlias
    if (categoriesAlias) {
      data[categoriesAlias] = data.categories
    }

    return data
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.schema = this.getSchema()
    this.contextKey = 'collection'
    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      categories: [],
      posts: [],
      levelPosts: [],
      attachments: []
    })
  }

  getIndexFile() {
    return this.fsNode.children.find(
      matcha.templateFile({
        nameOptions: this.settings.collectionAliases.concat('collection')
      })
    )
  }

  getSlug() {
    return this.__originalAttributes__.slug === null ?
      '' :
      this.slug || makeSlug(this.fsNode.name)
  }

  // override. because collection may not have index. it may have data file instead.
  getPermalink() {
    return makePermalink(
      this.context.peek().permalink,
      this.slug
    )
  }

  getSchema() {
    const collectionFSName = this.indexFile ?
      removeExtension(this.indexFile.name) :
      this.fsNode.name
    return this.settings.contentTypes
      .filter(ct => ct.model === 'collection')
      .find(ct => ct.collectionAlias === collectionFSName)
  }

  getSubtreeConfig() {
    const settings = {
      category: {
        defaultCategoryName: this.defaultCategoryName || this.schema?.defaultCategoryName || this.settings.defaultCategoryName,
        contentTypes: this.settings.contentTypes,
        entryContentType: this.entryContentType || this.schema?.entryContentType,
        categoryContentType: this.categoryContentType || this.schema?.categoryContentType,
        entryAlias: this.entryAlias || this.schema?.entryAlias,
        categoryAlias: this.categoryAlias || this.schema?.categoryAlias,
        entriesAlias: this.entriesAlias || this.schema?.entriesAlias,
        categoriesAlias: this.categoriesAlias || this.schema?.categoriesAlias,
        facetKeys: this.facets || this.schema?.facets || [],
        sortBy: this.sortBy || this.settings.sortBy,
        sortOrder: this.sortOrder || this.settings.sortOrder,
        mode: this.settings.mode,
        level: 1,
      },
      attachment: {}
    }

    const postMatcher = matcha.folderable({
      nameOptions: {
        index: [this.entryAlias, this.schema?.entryAlias, 'post', 'index']
      }
    })

    return [{
      matcher: matcha.dataFile({
        nameOptions: [this.fsNode.name]
      }),
      sideEffect: (tree, fsNode) => this.processDataFile(fsNode, tree)
    }, {
      matcher: postMatcher,
      sideEffect: (tree, fsNode) => this.addUncategorizedPost(fsNode, null, tree)
    }, {
      key: 'categories',
      model: models.Category,
      settings: settings.category,
      matcher: matcha.directory({
        childSearchDepth: 3,
        children: [ postMatcher ]
      }),
      sideEffect: (tree, entry) => tree.posts.push(...entry.subtree.posts)
    }, {
      key: 'attachments',
      model: models.Attachment,
      settings: settings.attachment,
      matcher: matcha.true()
    }]
  }

  addUncategorizedPost(childNode, postData, tree) {
    const childContext = this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: 'collection'
    })

    let defaultCategory = tree.categories.find(cat => cat.isDefaultCategory)
    if (!defaultCategory) {
      const defaultCategorySettings = {
        defaultCategoryName: this.defaultCategoryName || this.schema?.defaultCategoryName || this.settings.defaultCategoryName,
        categoryAlias: this.categoryAlias || this.schema?.categoryAlias,
        entryAlias: this.entryAlias || this.schema?.entryAlias,
        entriesAlias: this.entriesAlias || this.schema?.entriesAlias,
        categoriesAlias: this.categoriesAlias || this.schema?.categoriesAlias,
        entryContentType: this.entryContentType || this.schema?.entryContentType,
        categoryContentType: this.categoryContentType || this.schema?.categoryContentType,
        facetKeys: this.facets || this.schema?.facets || [],
        sortBy: this.sortBy || this.settings.sortBy,
        sortOrder: this.sortOrder || this.settings.sortOrder,
        mode: this.settings.mode,
        contentTypes: this.settings.contentTypes,
      }
      defaultCategory = new models.Category(
        { isDefaultCategory: true },
        childContext,
        defaultCategorySettings
      )
      tree.categories.push(defaultCategory)
    }

    const defaultCategoryChildContext = childContext.push({
      title: defaultCategory.title,
      slug: defaultCategory.slug,
      permalink: defaultCategory.permalink,
      outputPath: defaultCategory.outputPath,
      key: 'category'
    })
    const uncategorizedPostSettings = {
      entryAlias: this.entryAlias || this.schema?.entryAlias,
      entryContentType: this.entryContentType || this.schema?.entryContentType,
      contentTypes: this.settings.contentTypes,
      facetKeys: this.facets || this.schema?.facets || [],
    }
    const uncategorizedPost = new models.Post(
      childNode || postData,
      defaultCategoryChildContext,
      uncategorizedPostSettings
    )
    if (this.draftCheck(uncategorizedPost)) {
      defaultCategory.subtree.levelPosts.push(uncategorizedPost)
      defaultCategory.subtree.posts.push(uncategorizedPost)
      tree.levelPosts.push(uncategorizedPost)
      tree.posts.push(uncategorizedPost)
    }
  }

  processDataFile(fsNode, tree) {
    const data = JSON.parse(fsNode.content || '[]')
    if (!Array.isArray(data)) {
      return console.log('Collection data should be an array of objects', fsNode.name)
    }
    return data.forEach(entry => {
      this.addUncategorizedPost(null, entry, tree)
    })
  }

  afterEffects(contentModel) {
    const sortBy = this.sortBy || this.settings.sortBy
    const sortOrder = this.sortOrder || this.settings.sortOrder
    sort(this.subtree.posts, sortBy, sortOrder)
    Collection.locatePinnedEntries(this.subtree.posts)

    // this.facets was front-matter property. store it as facetKeys
    const facetKeys = this.facets || this.schema?.facets || []

    // this.facets now becomes instances of facet model
    this.facets = []

    if (facetKeys.length) {
      const childContext = this.context.push({
        title: this.title,
        slug: this.slug,
        permalink: this.permalink,
        outputPath: this.outputPath,
        key: 'collection'
      })

      this.facets = models.facet().collectFacets(
        this.subtree.posts,
        facetKeys,
        childContext
      )
    }

    this.subtree.categories.forEach(category => {
      category.afterEffects(contentModel, this.facets)
    })

    this.subtree.posts.forEach(post => {
      post.afterEffects(contentModel, this.facets)
    })

    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })

    this.facets.forEach(facet => {
      models.facet().afterEffects(contentModel, facet)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderCollection = () => {
      const renderHTML = renderer.paginate({
        basePermalink: this.permalink,
        posts: this.subtree.posts,
        postsPerPage: this.postsPerPage || 15,
        outputDir: this.outputPath,
        render: async ({ outputPath, pageOfPosts, paginationData }) => {
          const data = {
            ...contentModel,
            collection: Collection.serialize(this),
            pagination: paginationData,
            posts: pageOfPosts,
            settings,
            debug
          }

          // Alias for the current collection
          if (this.schema?.collectionAlias) {
            data[this.schema.collectionAlias] = data.collection
          }

          // Alias for the paginated 'posts'
          const entriesAlias = this.entriesAlias || this.schema?.entriesAlias
          if (entriesAlias) {
            data[entriesAlias] = data.posts
          }

          const contentType = this.contentType || this.schema?.name

          return renderer.render({
            templates: [
              `pages/${this.template}`,
              `pages/collection/${contentType}`,
              `pages/collection/default`
            ],
            outputPath,
            content: this.content,
            data
          })
        }
      })

      // TODO: Inspires a serialize method inside models/post
      const renderJSON = renderer.createFile({
        path: this.outputPath === this.context.peek().outputPath ?
          resolve(this.outputPath, `${makeSlug(this.title)}.json`) :
          resolve(this.outputPath, '..', `${this.slug}.json`),
        content: safeStringify({
          data: this.subtree.posts.map(models.Post.serialize),
          omit: [
            'absolutePath',
            'outputPath',
            'path',
            'depth',
            'extension',
            'stats',
            'hasIndex',
            'contentRaw',
            'contentType',
            'context'
          ]
        })
      })

      return Promise.all([
        renderHTML,
        renderJSON
      ])
    }

    const renderAttachments = () => {
      return Promise.all(
        this.subtree.attachments.map(attachment => {
          return attachment.render(renderer, { contentModel, settings, debug })
        })
      )
    }

    const renderCategories = () => {
      return Promise.all(
        this.subtree.categories.map(category => {
          return category.render(
            renderer, { contentModel, settings, debug }
          )
        })
      )
    }

    const renderFacets = () => {
      return models.facet().render(
        renderer, this.facets, { contentModel, settings, debug }
      )
    }

    return Promise.all([
      renderCollection(),
      renderAttachments(),
      renderCategories(),
      renderFacets()
    ])
  }
}

module.exports = Collection
