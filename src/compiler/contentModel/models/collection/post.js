const { join } = require('path')
const ContentModelEntryNode = require('../../../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../../../lib/contentModelHelpers')
const matcha = require('../../../../lib/matcha')

const models = {
  facet: require('./facet'),
  Attachment: require('../attachment')
}

const defaultSettings = {
  entryContentType: undefined,
  entryAlias: undefined,
  contentTypes: [],
  facetKeys: []
}
class Post extends ContentModelEntryNode {
  static serialize(post) {
    return {
      ...post,
      attachments: post.subtree.attachments.map(models.Attachment.serialize)
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)

    this.contentType = this.settings.entryContentType
    this.schema = this.settings.contentTypes.find(ct => ct.name === this.contentType)

    this.matchers = this.getSubtreeMatchers()
    this.subtree = this.parseSubtree()
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: [this.settings.entryAlias, 'post', 'index']
      })
    ) || this.fsNode
  }

  getSubtreeMatchers() {
    return {
      attachment: matcha.true()
    }
  }

  parseSubtree() {
    const tree = {
      attachments: []
    }

    if (!this.fsNode.children || !this.fsNode.children.length) {
      return tree
    }

    const childContext = this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: 'post'
    })

    this.fsNode.children.forEach(childNode => {
      if (childNode === this.indexFile) {
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

  afterEffects(contentModel, collectionFacets) {
    // TODO: feels like collection should handle this
    models.facet().linkWithEntryFields(this, collectionFacets, this.settings.facetKeys)

    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderPost = () => {
      const data = {
        ...contentModel,
        post: Post.serialize(this),
        settings,
        debug
      }
      if (this.settings.entryAlias) {
        data[this.settings.entryAlias] = data.post
      }

      return renderer.render({
        templates: [
          `pages/${this.template}`,
          `pages/post/${this.settings.entryAlias}`,
          `pages/post/${this.contentType}`,
          `pages/post/default`
        ],
        outputPath: join(...[
          this.outputPath,
          this.hasIndex ? 'index' : ''
        ].filter(Boolean)) + '.html',
        content: this.content,
        data
      })
    }

    const renderAttachments = () => {
      return Promise.all(
        this.subtree.attachments.map(attachment => {
          return attachment.render(renderer)
        })
      )
    }

    return Promise.all([
      renderPost(),
      renderAttachments()
    ])
  }
}

module.exports = Post
