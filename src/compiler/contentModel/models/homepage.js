const { join } = require('path')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../../lib/contentModelHelpers')

const models = {
  Attachment: require('./attachment'),
  collection: require('./collection')
}

const defaultSettings = {
  homepageDirectory: 'homepage'
}
class Homepage extends ContentModelEntryNode {
  static serialize(homepage) {
    return {
      ...homepage,
      attachments: homepage.subtree.attachments
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
  }

  getPermalink() {
    return this.context.peek().permalink
  }

  getOutputPath() {
    return this.context.peek().outputPath
  }

  getSubtreeMatchers() {
    return {
      indexFile: (fsNode) => {
        const indexFileNameOptions = ['index']
        if (fsNode.children) {
          return false
        }
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

    const context = {
      homepage: {
        title: this.title,
        slug: this.slug,
        permalink: this.permalink,
        outputPath: this.outputPath
      }
    }

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

  afterEffects(contentModel) {
    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderHomepage = () => {
      return renderer.render({
        templates: [
          `pages/${this.template}`,
          `pages/homepage/${this.contentType}`,
          `pages/homepage/default`
        ],
        outputPath: join(this.outputPath, 'index.html'),
        content: this.content,
        data: {
          ...contentModel,
          collections: contentModel.collections.map(models.collection().serialize),
          settings,
          debug
        }
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
      renderHomepage(),
      renderAttachments()
    ])
  }
}

module.exports = Homepage
