const { join } = require('path')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const matcha = require('../../../lib/matcha')

const models = {
  facet: require('./facet'),
  Attachment: require('../attachment')
}

const defaultSettings = {
  mode: 'start',
  contentTypes: [],
}
class Post extends ContentModelEntryNode {
  static serialize(post) {
    const postWithSerializedLinks = {
      ...post,
      ...post.serializeLinks()
    }
    // TODO: feels like collection should handle this
    models.facet().linkWithEntryFields(
      postWithSerializedLinks,
      post.collectionFacets,
      post.__parentSchema__.facetKeys
    )

    return {
      ...postWithSerializedLinks,
      attachments: post.subtree.attachments.map(models.Attachment.serialize)
    }
  }

  constructor(fsNode, context, schema, settings = defaultSettings) {
    super(fsNode, context, schema, settings)

    this.contentType = this.contentType || schema.entryContentType
    this.__schema__ = this.getSchema(schema)

    this.contextKey = 'post'
    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      attachments: []
    })
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: [this.__parentSchema__.entryAlias, 'post', 'index']
      })
    ) || this.fsNode
  }

  getSchema(parentSchema) {
    const contentType = this.settings.contentTypes.find(ct => {
      return ct.model === 'entry' && (
        ct.name === this.contentType ||
        ct.name === parentSchema.entryContentType
      )
    })

    return {
      ...(contentType || {}),
      ...this.__schema__
    }
  }

  getInheritedSchema() {
    return {
      ...this.__parentSchema__,
      ...this.__schema__
    }
  }

  getSubtreeConfig() {
    return [{
      key: 'attachments',
      model: models.Attachment,
      schema: {},
      matcher: matcha.true()
    }]
  }

  afterEffects(contentModel, collectionFacets) {
    this.collectionFacets = collectionFacets
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

      const inheritedSchema = this.getInheritedSchema()

      if (inheritedSchema.entryAlias) {
        data[inheritedSchema.entryAlias] = data.post
      }

      return renderer.render({
        templates: [
          `pages/${this.template}`,
          `pages/post/${inheritedSchema.entryAlias}`,
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
