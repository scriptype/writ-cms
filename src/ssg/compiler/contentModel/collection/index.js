const { resolve } = require('path')
const makeSlug = require('slug')
const _ = require('lodash')
const { removeExtension } = require('../../../helpers')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const { makePermalink, safeStringify, sort } = require('../../../lib/contentModelHelpers')

const matcha = require('../../../lib/matcha')

const models = {
  Attachment: require('../attachment'),
  Category: require('./category'),
  Post: require('./post'),
  facet: require('./facet')
}

const defaultSettings = {
  mode: 'start',
  contentTypes: [],
  sortBy: 'date',
  sortOrder: -1
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
      ...collection.serializeLinks(),
      __facets__: collection.__facets__.map(models.facet().serialize),
      categories: collection.subtree.categories.map(models.Category.serialize),
      posts: collection.subtree.posts.map(models.Post.serialize),
      levelPosts: collection.subtree.levelPosts.map(models.Post.serialize),
      attachments: collection.subtree.attachments.map(models.Attachment.serialize)
    }

    // Alias for posts key in collection
    const entriesAlias = collection.__schema__.entriesAlias
    if (entriesAlias) {
      data[entriesAlias] = data.posts
    }

    // Alias for categories key in collection
    const categoriesAlias = collection.__schema__.categoriesAlias
    if (categoriesAlias) {
      data[categoriesAlias] = data.categories
    }

    return data
  }

  constructor(fsNode, context, schema, settings = defaultSettings) {
    super(fsNode, context, schema, settings)
    this.__schema__ = this.getSchema(schema)
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
        nameOptions: this.__parentSchema__.collectionAliases
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

    const contentType = this.settings.contentTypes
      .filter(ct => ct.model === 'collection')
      .find(ct => ct.collectionAlias === collectionFSName)

    return {
      ...(contentType || {}),
      ...this.__schema__
    }
  }

  getInheritedSchema() {
    return {
      defaultCategoryName:
        this.__schema__.defaultCategoryName ||
        this.__parentSchema__.defaultCategoryName,
      entryContentType:
        this.__schema__.entryContentType ||
        this.__parentSchema__.entryContentType,
      categoryContentType:
        this.__schema__.categoryContentType ||
        this.__parentSchema__.categoryContentType,
      entryAlias:
        this.__schema__.entryAlias ||
        this.__parentSchema__.entryAlias,
      categoryAlias:
        this.__schema__.categoryAlias ||
        this.__parentSchema__.categoryAlias,
      entriesAlias:
        this.__schema__.entriesAlias ||
        this.__parentSchema__.entriesAlias,
      categoriesAlias:
        this.__schema__.categoriesAlias ||
        this.__parentSchema__.categoriesAlias,
      facetKeys:
        this.__schema__.facets || []
    }
  }

  getInheritedSettings() {
    return {
      mode: this.settings.mode,
      sortBy: this.sortBy || this.settings.sortBy,
      sortOrder: this.sortOrder || this.settings.sortOrder,
      contentTypes: this.settings.contentTypes
    }
  }

  getSubtreeConfig() {
    const postMatcher = matcha.folderable({
      nameOptions: {
        index: [this.getInheritedSchema().entryAlias, 'post', 'index']
      }
    })

    return [{
      matcher: matcha.dataFile({
        nameOptions: [this.fsNode.name]
      }),
      schema: {},
      sideEffect: (tree, fsNode) => this.processDataFile(fsNode, tree)
    }, {
      matcher: postMatcher,
      schema: _.pick(this.getInheritedSchema(), [
        'entryAlias',
        'entryContentType',
        'facetKeys'
      ]),
      sideEffect: (tree, fsNode) => this.addUncategorizedPost(fsNode, null, tree)
    }, {
      key: 'categories',
      model: models.Category,
      schema: this.getInheritedSchema(),
      settings: {
        ...this.getInheritedSettings(),
        level: 1
      },
      matcher: matcha.directory({
        childSearchDepth: 3,
        children: [ postMatcher ]
      }),
      sideEffect: (tree, entry) => tree.posts.push(...entry.subtree.posts)
    }, {
      key: 'attachments',
      model: models.Attachment,
      schema: {},
      settings: _.pick(this.getInheritedSettings(), ['mode']),
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
      defaultCategory = new models.Category(
        { isDefaultCategory: true },
        childContext,
        this.getInheritedSchema(),
        this.getInheritedSettings()
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

    const uncategorizedPost = new models.Post(
      childNode || postData,
      defaultCategoryChildContext,
      _.pick(this.getInheritedSchema(), [
        'entryAlias',
        'entryContentType',
        'facetKeys'
      ]),
      _.pick(this.getInheritedSettings(), [
        'mode',
        'contentTypes'
      ])
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

    // store the schema.facets as facetKeys
    const facetKeys = this.__schema__.facets || []

    // store instances of facet model
    this.__facets__ = []

    if (facetKeys.length) {
      const childContext = this.context.push({
        title: this.title,
        slug: this.slug,
        permalink: this.permalink,
        outputPath: this.outputPath,
        key: 'collection'
      })

      this.__facets__ = models.facet().collectFacets(
        this.subtree.posts.map(post => ({
          ...post,
          ...post.serializeLinks()
        })),
        facetKeys,
        childContext
      )
    }

    this.subtree.categories.forEach(category => {
      category.afterEffects(contentModel, this.__facets__)
    })

    this.subtree.posts.forEach(post => {
      post.afterEffects(contentModel, this.__facets__)
    })

    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })

    this.__facets__.forEach(facet => {
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
          if (this.__schema__.collectionAlias) {
            data[this.__schema__.collectionAlias] = data.collection
          }

          // Alias for the paginated 'posts'
          const entriesAlias = this.__schema__.entriesAlias
          if (entriesAlias) {
            data[entriesAlias] = data.posts
          }

          const contentType = this.contentType || this.__schema__.name

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
        renderer, this.__facets__, { contentModel, settings, debug }
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
