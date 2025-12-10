const { join, resolve } = require('path')
const makeSlug = require('slug')
const _ = require('lodash')
const ContentModelEntryNode = require('../../../../lib/ContentModelEntryNode')
const {
  removeExtension,
  isTemplateFile,
  makePermalink,
  safeStringify,
  sort
} = require('../../../../lib/contentModelHelpers')

const matcha = require('../../../../lib/matcha')

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
    const entriesAlias = collection.entriesAlias || collection.settings.contentType?.entriesAlias
    if (entriesAlias) {
      data[entriesAlias] = data.posts
    }

    // Alias for categories key in collection
    const categoriesAlias = collection.categoriesAlias || collection.settings.contentType?.categoriesAlias
    if (categoriesAlias) {
      data[categoriesAlias] = data.categories
    }

    return data
  }

  static draftCheck (mode, node) {
    return mode === 'start' || !node.draft
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.subtree = this.parseSubtree()
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

  getSubtreeMatchers() {
    const postMatcher = matcha.folderable({
      nameOptions: {
        index: [this.entryAlias, this.settings.contentType?.entryAlias, 'post', 'index']
      }
    })

    return {
      indexFile: matcha.templateFile({
        nameOptions: (this.settings.collectionAliases || []).concat('collection').filter(Boolean)
      }),

      dataFile: matcha.dataFile({
        nameOptions: [this.fsNode.name]
      }),

      category: matcha.directory({
        childSearchDepth: 3,
        children: [ postMatcher ]
      }),

      post: postMatcher,

      attachment: matcha.true()
    }
  }

  parseSubtree() {
    const tree = {
      indexFile: this.indexFile,
      categories: [],
      posts: [],
      levelPosts: [],
      attachments: []
    }

    const childContext = this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: 'collection'
    })

    this.fsNode.children.forEach(childNode => {
      if (this.matchers.indexFile(childNode)) {
        return
      }

      if (this.matchers.dataFile(childNode, this.fsNode)) {
        const data = JSON.parse(childNode.content || '[]')
        if (!Array.isArray(data)) {
          return console.log('Collection data should be an array of objects', childNode.name)
        }
        return data.forEach(entry => {
          this.addUncategorizedPost(null, entry, tree)
        })
      }

      if (this.matchers.post(childNode)) {
        return this.addUncategorizedPost(childNode, null, tree)
      }

      if (this.matchers.category(childNode)) {
        const categorySettings = {
          defaultCategoryName: this.defaultCategoryName || this.settings.contentType?.defaultCategoryName || this.settings.defaultCategoryName,
          contentTypes: this.settings.contentTypes,
          entryContentType: this.entryContentType || this.settings.contentType?.entryContentType,
          categoryContentType: this.categoryContentType || this.settings.contentType?.categoryContentType,
          entryAlias: this.entryAlias || this.settings.contentType?.entryAlias,
          categoryAlias: this.categoryAlias || this.settings.contentType?.categoryAlias,
          entriesAlias: this.entriesAlias || this.settings.contentType?.entriesAlias,
          categoriesAlias: this.categoriesAlias || this.settings.contentType?.categoriesAlias,
          facetKeys: this.facets || this.settings.contentType?.facets || [],
          sortBy: this.sortBy || this.settings.sortBy,
          sortOrder: this.sortOrder || this.settings.sortOrder,
          mode: this.settings.mode,
          level: 1,
        }
        const newCategory = new models.Category(childNode, childContext, categorySettings)
        if (Collection.draftCheck(this.settings.mode, newCategory)) {
          tree.categories.push(newCategory)
          tree.posts.push(...newCategory.subtree.posts)
        }
        return
      }

      if (this.matchers.attachment(childNode)) {
        tree.attachments.push(
          new models.Attachment(childNode, childContext)
        )
      }
    })

    return tree
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
        defaultCategoryName: this.defaultCategoryName || this.settings.contentType?.defaultCategoryName || this.settings.defaultCategoryName,
        categoryAlias: this.categoryAlias || this.settings.contentType?.categoryAlias,
        entryAlias: this.entryAlias || this.settings.contentType?.entryAlias,
        entriesAlias: this.entriesAlias || this.settings.contentType?.entriesAlias,
        categoriesAlias: this.categoriesAlias || this.settings.contentType?.categoriesAlias,
        entryContentType: this.entryContentType || this.settings.contentType?.entryContentType,
        categoryContentType: this.categoryContentType || this.settings.contentType?.categoryContentType,
        facetKeys: this.facets || this.settings.contentType?.facets || [],
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
      entryAlias: this.entryAlias || this.settings.contentType?.entryAlias,
      entryContentType: this.entryContentType || this.settings.contentType?.entryContentType,
      contentTypes: this.settings.contentTypes,
      facetKeys: this.facets || this.settings.contentType?.facets || [],
    }
    const uncategorizedPost = new models.Post(
      childNode || postData,
      defaultCategoryChildContext,
      uncategorizedPostSettings
    )
    if (models.Category.draftCheck(this.settings.mode, uncategorizedPost)) {
      defaultCategory.subtree.levelPosts.push(uncategorizedPost)
      defaultCategory.subtree.posts.push(uncategorizedPost)
      tree.levelPosts.push(uncategorizedPost)
      tree.posts.push(uncategorizedPost)
    }
  }

  afterEffects(contentModel) {
    const sortBy = this.sortBy || this.settings.sortBy
    const sortOrder = this.sortOrder || this.settings.sortOrder
    sort(this.subtree.posts, sortBy, sortOrder)
    Collection.locatePinnedEntries(this.subtree.posts)

    // this.facets was front-matter property. store it as facetKeys
    const facetKeys = this.facets || this.settings.contentType?.facets || []

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
          if (this.settings.contentType?.collectionAlias) {
            data[this.settings.contentType.collectionAlias] = data.collection
          }

          // Alias for the paginated 'posts'
          const entriesAlias = this.entriesAlias || this.settings.contentType?.entriesAlias
          if (entriesAlias) {
            data[entriesAlias] = data.posts
          }

          const contentType = this.contentType || this.settings.contentType?.name

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
