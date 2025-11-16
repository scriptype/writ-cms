const { join } = require('path')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../../lib/contentModelHelpers')

const models = {
  collection: require('./collection'),
  Attachment: require('./attachment'),
}

const defaultSettings = {
  pagesDirectory: 'pages'
}
class Subpage extends ContentModelEntryNode {
  static serialize(subpage) {
    return {
      ...subpage,
      attachments: subpage.subtree.attachments
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
  }

  getSubtreeMatchers() {
    return {
      indexFile: (fsNode) => {
        if (fsNode.children) {
          return false
        }
        const indexFileNameOptions = ['index']
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
      key: 'page'
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

  afterEffects(contentModel) {
    this.subtree.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderSubpage = () => {
      return renderer.render({
        templates: [
          `pages/${this.template}`,
          `pages/subpage/${this.contentType}`,
          `pages/subpage/default`
        ],
        outputPath: join(...[
          this.outputPath,
          this.hasIndex ? 'index' : ''
        ]) + '.html',
        content: this.content,
        data: {
          ...contentModel,
          collections: contentModel.collections.map(models.collection().serialize),
          subpage: Subpage.serialize(this),
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
      renderSubpage(),
      renderAttachments()
    ])
  }
}

module.exports = Subpage
