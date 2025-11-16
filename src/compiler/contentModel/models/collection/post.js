const { join } = require('path')
const ContentModelEntryNode = require('../../../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../../../lib/contentModelHelpers')

const models = {
  facet: require('./facet'),
  Attachment: require('../attachment')
}

const defaultSettings = {
  entryAlias: undefined
}
class Post extends ContentModelEntryNode {
  static serialize(post) {
    return {
      ...post,
      attachments: post.subtree.attachments
    }
  }

  constructor(fsNode, context, contentTypes, settings = defaultSettings) {
    super(fsNode, context, settings)

    this.contentType = this.context.peek().entryContentType
    this.schema = contentTypes.find(ct => ct.name === this.contentType)
  }

  getSubtreeMatchers() {
    return {
      indexFile: (fsNode) => {
        if (fsNode.children) {
          return false
        }
        const indexFileNameOptions = [this.settings.entryAlias, 'post', 'index'].filter(Boolean)
        const names = indexFileNameOptions.join('|')
        const extensions = templateExtensions.join('|')
        const namePattern = new RegExp(`^(${names})(${extensions})$`, 'i')
        return fsNode.name.match(namePattern)
      },

      attachment: (fsNode) => true
    }
  }

  parseSubtree() {
    const tree = {
      indexFile: this.fsNode,
      attachments: []
    }

    if (!this.fsNode.children || !this.fsNode.children.length) {
      return tree
    }

    const context = this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: 'post'
    })

    this.fsNode.children.forEach(childNode => {
      if (this.matchers.indexFile(childNode)) {
        return
      }
      if (this.matchers.attachment(childNode)) {
        tree.attachments.push(
          new models.Attachment(childNode, context)
        )
      }
    })

    return tree
  }

  afterEffects(contentModel, collectionFacets) {
    // TODO: feels like collection should handle this
    models.facet().linkWithEntryFields(this, collectionFacets)

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
