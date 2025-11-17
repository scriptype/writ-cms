const makeSlug = require('slug')
const _ = require('lodash')
const ContentModelEntryNode = require('../../../../lib/ContentModelEntryNode')
const { makePermalink, isTemplateFile, sort } = require('../../../../lib/contentModelHelpers')

const models = {
  Post: require('./post'),
  facet: require('./facet'),
  Attachment: require('../attachment')
}

const defaultSettings = {
  categoryAlias: undefined,
  entryAlias: undefined,
  mode: 'start',
  level: 1,
  contentTypes: []
}
class Category extends ContentModelEntryNode {
  static linkPosts(post, postIndex, posts) {
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

  static serialize(category, entriesAlias, categoriesAlias) {
    const data = {
      ...category,
      facets: category.facets.map(models.facet().serialize),
      posts: category.subtree.posts,
      levelPosts: category.subtree.levelPosts,
      categories: category.subtree.categories,
      attachments: category.subtree.attachments
    }

    if (entriesAlias) {
      data[entriesAlias] = data.posts
    }

    if (categoriesAlias) {
      data[entriesAlias] = data.categories
    }
  }

  static draftCheck (mode, node) {
    return mode === 'start' || !node.draft
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)

    if (fsNode.isDefaultCategory) {
      const title = context.peek().defaultCategoryName
      const slug = makeSlug(title)
      const { entriesAlias, categoriesAlias } = context.peek()

      const defaultCategory = {
        contentType: context.peek().categoryContentType,
        categoryContentType: context.peek().categoryContentType,
        entryContentType: context.peek().entryContentType,
        categoryAlias: context.peek().categoryAlias,
        entryAlias: context.peek().entryAlias,
        categoriesAlias: context.peek().categoriesAlias,
        entriesAlias: context.peek().entriesAlias,
        facetKeys: context.peek().facetKeys || [],
        facets: [],
        sortBy: context.peek().sortBy,
        sortOrder: context.peek().sortOrder,
        title,
        slug,
        content: '',
        contentRaw: '',
        isDefaultCategory: true,
        level: this.settings.level
      }

      if (entriesAlias) {
        defaultCategory[entriesAlias] = defaultCategory.levelPosts.posts
      }

      if (categoriesAlias) {
        defaultCategory[categoriesAlias] = defaultCategory.categories
      }

      return Object.assign(this, defaultCategory)
    }

    const categoryContext = {
      contentType: context.peek().categoryContentType,
      categoryContentType: this.categoryContentType || context.peek().categoryContentType,
      entryContentType: this.entryContentType || context.peek().entryContentType,
      categoryAlias: this.categoryAlias || context.peek().categoryAlias,
      entryAlias: this.entryAlias || context.peek().entryAlias,
      categoriesAlias: this.categoriesAlias || context.peek().categoriesAlias,
      entriesAlias: this.entriesAlias || context.peek().entriesAlias,
      facetKeys: context.peek().facetKeys || [],
      facets: [],
      sortBy: this.sortBy || context.peek().sortBy,
      sortOrder: this.sortOrder || context.peek().sortOrder,
      title: this.title || fsNode.name,
      slug: this.slug,
      level: this.settings.level
    }

    Object.assign(this, categoryContext)
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

  getSubtreeMatchers() {
    // copy-pasted from matchers.js
    return {
      indexFile: fsNode => {
        const indexFileNameOptions = [this.settings.categoryAlias, 'category'].filter(Boolean)
        return isTemplateFile(fsNode) && fsNode.name.match(
          new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
        )
      },

      category: (fsNode, level) => {
        return fsNode.children?.find(childNode => {
          const containsPosts = this.matchers.post(childNode)
          if (level > 3) {
            return containsPosts
          }
          const containsSubCategories = this.matchers.category(childNode, level)
          return containsSubCategories || containsPosts
        })
      },

      postIndexFile: fsNode => {
        const indexFileNameOptions = [this.entryAlias, 'post', 'index'].filter(Boolean)
        return (
          isTemplateFile(fsNode) &&
          fsNode.name.match(
            new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
          )
        )
      },

      post: fsNode => {
        return isTemplateFile(fsNode) || fsNode.children?.find(this.matchers.postIndexFile)
      },

      attachment: fsNode => true
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

    if (this.entriesAlias) {
      tree[this.entriesAlias] = tree.posts
    }

    if (this.categoriesAlias) {
      tree[this.categoriesAlias] = tree.categories
    }

    if (!this.fsNode.children || !this.fsNode.children.length) {
      return tree
    }

    const contextKey = this.settings.level === 1 ?
      'category' :
      `subCategory${this.settings.level - 1}`

    this.fsNode.children.forEach(childNode => {
      const childContext = this.context.push({
        ..._.omit(this, [
          'context',
          'contentRaw',
          'content',
          'facets'
        ]),
        key: contextKey
      })

      if (this.matchers.indexFile(childNode)) {
        return
      }

      if (this.matchers.post(childNode)) {
        const post = new models.Post(
          childNode,
          childContext,
          this.settings.contentTypes,
          { entryAlias: this.settings.entryAlias }
        )
        if (Category.draftCheck(this.settings.mode, post)) {
          tree.levelPosts.push(post)
          tree.posts.push(post)
        }
        return
      }

      if (this.matchers.category(childNode, this.settings.level)) {
        const subCategory = new Category(
          childNode,
          childContext,
          {
            contentTypes: this.settings.contentTypes,
            entryAlias: this.entryAlias || this.settings.entryAlias,
            categoryAlias: this.categoryAlias || this.settings.categoryAlias,
            level: this.settings.level + 1
          }
        )
        if (Category.draftCheck(this.settings.mode, subCategory)) {
          tree.categories.push(subCategory)
          tree.posts.push(...subCategory.subtree.posts)
        }
        return
      }

      if (this.matchers.attachment(childNode)) {
        return tree.attachments.push(
          new models.Attachment(childNode, childContext)
        )
      }
    })

    return tree
  }

  afterEffects(contentModel, collectionFacets) {
    if (this.facetKeys.length) {
      const categoryContext = _.omit(this, [
        'context',
        'contentRaw',
        'content',
        'categories',
        'posts',
        'attachments',
        'facets'
      ])

      this.facets = models.facet().collectFacets(
        this.subtree.posts,
        this.facetKeys,
        this.context.push({
          ...categoryContext,
          key: 'category'
        })
      )
    }

    this.subtree.categories.forEach(subCategory => {
      subCategory.afterEffects(contentModel, collectionFacets)
    })

    sort(this.subtree.posts, this.sortBy, this.sortOrder)
    this.subtree.posts.forEach(Category.linkPosts)

    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderCategory = () => {
      if (this.isDefaultCategory && !this.slug) {
        return
      }
      return renderer.paginate({
        basePermalink: this.permalink,
        posts: this.subtree.posts,
        postsPerPage: this.postsPerPage || 15, //this.context.peek().postsPerPage
        outputDir: this.outputPath,
        render: async ({ outputPath, pageOfPosts, paginationData }) => {
          const data = {
            ...contentModel,
            category: Category.serialize(this, this.entriesAlias, this.categoriesAlias),
            pagination: paginationData,
            posts: pageOfPosts,
            settings,
            debug
          }
          const categoryAlias = this.context.peek().categoryAlias
          if (categoryAlias) {
            data[categoryAlias] = data.category
          }
          if (this.entriesAlias) {
            data[this.entriesAlias] = data.posts
          }
          return renderer.render({
            templates: [
              `pages/${this.template}`,
              `pages/category/${this.contentType}`,
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
