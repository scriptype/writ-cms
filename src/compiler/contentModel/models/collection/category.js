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
  contentTypes: [],
  facetKeys: []
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

  static serialize(category) {
    const data = {
      ...category,
      facets: category.facets.map(models.facet().serialize),
      posts: category.subtree.posts.map(models.Post.serialize),
      levelPosts: category.subtree.levelPosts.map(models.Post.serialize),
      categories: category.subtree.categories.map(Category.serialize),
      attachments: category.subtree.attachments.map(models.Attachment.serialize)
    }

    if (category.entriesAlias) {
      data[category.entriesAlias] = data.posts
    }

    if (category.categoriesAlias) {
      data[category.categoriesAlias] = data.categories
    }

    return data
  }

  static draftCheck (mode, node) {
    return mode === 'start' || !node.draft
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)

    if (fsNode.isDefaultCategory) {
      return this.makeDefaultCategory()
    }
  }

  makeDefaultCategory() {
    const title = this.settings.defaultCategoryName

    return Object.assign(this, {
      facets: [],
      title,
      slug: makeSlug(title),
      content: '',
      contentRaw: '',
      isDefaultCategory: true
    })
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
        const indexFileNameOptions = [this.settings.entryAlias, 'post', 'index'].filter(Boolean)
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

    const entriesAlias = this.entriesAlias || this.settings.entriesAlias
    const categoriesAlias = this.categoriesAlias || this.settings.categoriesAlias

    if (entriesAlias) {
      tree[entriesAlias] = tree.posts
    }

    if (categoriesAlias) {
      tree[categoriesAlias] = tree.categories
    }

    if (!this.fsNode.children || !this.fsNode.children.length) {
      return tree
    }

    const contextKey = this.settings.level === 1 ?
      'category' :
      `subCategory${this.settings.level - 1}`

    const childContext = this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: contextKey
    })

    this.fsNode.children.forEach(childNode => {
      if (this.matchers.indexFile(childNode)) {
        return
      }

      if (this.matchers.post(childNode)) {
        const postSettings = {
          entryAlias: this.entryAlias || this.settings.entryAlias,
          entryContentType: this.entryContentType || this.settings.entryContentType,
          contentTypes: this.settings.contentTypes,
          facetKeys: this.settings.facetKeys
        }
        const post = new models.Post(childNode, childContext, postSettings)
        if (Category.draftCheck(this.settings.mode, post)) {
          tree.levelPosts.push(post)
          tree.posts.push(post)
        }
        return
      }

      if (this.matchers.category(childNode, this.settings.level)) {
        const subCategorySettings = {
          contentTypes: this.settings.contentTypes,
          entryContentType: this.entryContentType || this.settings.entryContentType,
          entryAlias: this.entryAlias || this.settings.entryAlias,
          categoryAlias: this.categoryAlias || this.settings.categoryAlias,
          entriesAlias: this.entriesAlias || this.settings.entriesAlias,
          categoriesAlias: this.categoriesAlias || this.settings.categoriesAlias,
          sortBy: this.sortBy || this.settings.sortBy,
          sortOrder: this.sortOrder || this.settings.sortOrder,
          facetKeys: this.settings.facetKeys,
          mode: this.settings.mode,
          level: this.settings.level + 1
        }
        const subCategory = new Category(childNode, childContext, subCategorySettings)
        if (Category.draftCheck(this.settings.mode, subCategory)) {
          tree.categories.push(subCategory)
          tree.posts.push(...subCategory.subtree.posts)
        }
        return
      }

      if (this.matchers.attachment(childNode)) {
        const attachmentSettings = {}
        const attachment = new models.Attachment(childNode, childContext, attachmentSettings)
        return tree.attachments.push(attachment)
      }
    })

    return tree
  }

  afterEffects(contentModel, collectionFacets) {
    if (this.settings.facetKeys.length) {
      const contextKey = this.settings.level === 1 ?
        'category' :
        `subCategory${this.settings.level - 1}`

      const childContext = this.context.push({
        title: this.title,
        slug: this.slug,
        permalink: this.permalink,
        outputPath: this.outputPath,
        key: contextKey
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
          const { categoryAlias, entriesAlias } = this.settings
          if (categoryAlias) {
            data[categoryAlias] = data.category
          }
          if (entriesAlias) {
            data[entriesAlias] = data.posts
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
