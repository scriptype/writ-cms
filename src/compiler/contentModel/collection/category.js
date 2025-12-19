const makeSlug = require('slug')
const _ = require('lodash')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const { makePermalink, isTemplateFile, sort } = require('../../../lib/contentModelHelpers')
const matcha = require('../../../lib/matcha')

const models = {
  Post: require('./post'),
  facet: require('./facet'),
  Attachment: require('../attachment')
}

const defaultSettings = {
  categoryAlias: undefined,
  entryAlias: undefined,
  categoriesAlias: undefined,
  entriesAlias: undefined,
  mode: 'start',
  level: 1,
  contentTypes: [],
  facetKeys: []
}
class Category extends ContentModelEntryNode {
  static linkNextPrevPosts(post, postIndex, posts) {
    post.links = post.links || {}

    const nextPost = posts[postIndex - 1]
    if (nextPost) {
      post.links.nextPost = {
        title: nextPost.title,
        permalink: nextPost.permalink
      }
    }
    const previousPost = posts[postIndex + 1]
    if (previousPost) {
      post.links.previousPost = {
        title: previousPost.title,
        permalink: previousPost.permalink
      }
    }
  }

  static serialize(category) {
    const data = {
      ...category,
      facets: category.facets.map(models.facet().serialize),
      posts: category.subtree.posts.map(models.Post.serialize),
      levelPosts: category.subtree.levelPosts.map(models.Post.serialize),
      categories: category.subtree.categories.map(Category.serialize),
      attachments: category.subtree.attachments.map(models.Attachment.serialize)
    }

    // Alias for the posts key in category
    const entriesAlias = category.entriesAlias || category.settings.entriesAlias
    if (entriesAlias) {
      data[entriesAlias] = data.posts
    }

    // Alias for the categories key in category
    const categoriesAlias = category.categoriesAlias || category.settings.categoriesAlias
    if (categoriesAlias) {
      data[categoriesAlias] = data.categories
    }

    return data
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)

    this.facets = []
    this.contextKey = this.settings.level === 1 ?
      'category' :
      `subCategory${this.settings.level - 1}`

    if (fsNode.isDefaultCategory) {
      return this.makeDefaultCategory()
    }

    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      categories: [],
      posts: [],
      levelPosts: [],
      attachments: []
    })
  }

  makeDefaultCategory() {
    const title = this.settings.defaultCategoryName

    return Object.assign(this, {
      facets: [],
      title,
      slug: makeSlug(title),
      content: '',
      contentRaw: '',
      isDefaultCategory: true,
      subtree: {
        levelPosts: [],
        posts: [],
        categories: [],
        attachments: []
      }
    })
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: [this.settings.categoryAlias, 'category']
      })
    ) || this.fsNode
  }

  getPermalink() {
    if (this.fsNode.isDefaultCategory) {
      return this.context.peek().permalink
    }
    return makePermalink(
      this.context.peek().permalink,
      this.slug
    )
  }

  getSubtreeConfig() {
    const settings = {
      post: {
        entryAlias: this.entryAlias || this.settings.entryAlias,
        entryContentType: this.entryContentType || this.settings.entryContentType,
        contentTypes: this.settings.contentTypes,
        facetKeys: this.settings.facetKeys
      },
      subCategory: {
        contentTypes: this.settings.contentTypes,
        entryContentType: this.entryContentType || this.settings.entryContentType,
        categoryContentType: this.categoryContentType || this.settings.categoryContentType,
        entryAlias: this.entryAlias || this.settings.entryAlias,
        categoryAlias: this.categoryAlias || this.settings.categoryAlias,
        entriesAlias: this.entriesAlias || this.settings.entriesAlias,
        categoriesAlias: this.categoriesAlias || this.settings.categoriesAlias,
        sortBy: this.sortBy || this.settings.sortBy,
        sortOrder: this.sortOrder || this.settings.sortOrder,
        facetKeys: this.settings.facetKeys,
        mode: this.settings.mode,
        level: this.settings.level + 1
      },
      attachment: {}
    }

    const postMatcher = matcha.folderable({
      nameOptions: {
        index: [this.settings.entryAlias, 'post', 'index']
      }
    })

    return [{
      key: 'posts',
      model: models.Post,
      matcher: postMatcher,
      sideEffect: (tree, entry) => tree.levelPosts.push(entry),
      settings: settings.post
    }, {
      key: 'categories',
      model: Category,
      matcher: matcha.directory({
        childSearchDepth: 3,
        children: [ postMatcher ]
      }),
      sideEffect: (tree, entry) => tree.posts.push(...entry.subtree.posts),
      settings: settings.subCategory
    }, {
      key: 'attachments',
      model: models.Attachment,
      matcher: matcha.true(),
      settings: settings.attachment
    }]
  }

  afterEffects(contentModel, collectionFacets) {
    if (this.settings.facetKeys.length) {
      const childContext = this.context.push({
        title: this.title,
        slug: this.slug,
        permalink: this.permalink,
        outputPath: this.outputPath,
        key: this.contextKey
      })

      this.facets = models.facet().collectFacets(
        this.subtree.posts,
        this.settings.facetKeys,
        childContext
      )
    }

    this.subtree.categories.forEach(subCategory => {
      subCategory.afterEffects(contentModel, collectionFacets)
    })

    const sortBy = this.sortBy || this.settings.sortBy
    const sortOrder = this.sortOrder || this.settings.sortOrder
    sort(this.subtree.posts, sortBy, sortOrder)
    this.subtree.posts.forEach(Category.linkNextPrevPosts)

    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderCategory = () => {
      return renderer.paginate({
        basePermalink: this.permalink,
        posts: this.subtree.posts,
        postsPerPage: this.postsPerPage || 15, //this.settings.postsPerPage
        outputDir: this.outputPath,
        render: async ({ outputPath, pageOfPosts, paginationData }) => {
          const data = {
            ...contentModel,
            category: Category.serialize(this),
            pagination: paginationData,
            posts: pageOfPosts,
            settings,
            debug
          }

          // Alias for the current category
          if (this.settings.categoryAlias) {
            data[this.settings.categoryAlias] = data.category
          }

          // Alias for the paginated 'posts'
          const entriesAlias = this.entriesAlias || this.settings.entriesAlias
          if (entriesAlias) {
            data[entriesAlias] = data.posts
          }

          const contentType = this.contentType || this.settings.categoryContentType
          return renderer.render({
            templates: [
              `pages/${this.template}`,
              `pages/category/${contentType}`,
              `pages/category/default`
            ],
            outputPath,
            content: this.content,
            data
          })
        }
      })
    }

    const renderSubCategories = () => {
      return Promise.all(
        this.subtree.categories.map(subCategory => {
          return subCategory.render(renderer, { contentModel, settings, debug })
        })
      )
    }

    const renderPosts = () => {
      return Promise.all(
        this.subtree.levelPosts.map(post => {
          return post.render(renderer, { contentModel, settings, debug })
        })
      )
    }

    const renderAttachments = () => {
      return Promise.all(
        this.subtree.attachments.map(attachment => {
          return attachment.render(renderer, { contentModel, settings, debug })
        })
      )
    }

    const renderFacets = () => {
      if (!this.facets?.length) {
        return
      }
      return models.facet().render(
        renderer, this.facets, { contentModel, settings, debug }
      )
    }

    /* Uncategorized posts are rendered by the default category.
     * If default category is untitled, it should render only the posts.
     * Otherwise it'll race with collection to render at same outputPaths. */
    const isUntitledDefaultCategory = this.isDefaultCategory && !this.slug
    if (isUntitledDefaultCategory) {
      return renderPosts()
    }

    return Promise.all([
      renderCategory(),
      renderSubCategories(),
      renderPosts(),
      renderAttachments(),
      renderFacets()
    ])
  }
}

module.exports = Category
