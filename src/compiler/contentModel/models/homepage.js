const { join } = require('path')
const ContentModelNode = require('../../../lib/ContentModelNode')
const { templateExtensions } = require('../../../lib/contentModelHelpers')
const { parseTextEntry } = require('../../../lib/parseTextEntry')

const models = {
  Attachment: require('./attachment'),
  collection: require('./collection')
}

const defaultSettings = {
  homepageDirectory: 'homepage'
}
class Homepage extends ContentModelNode {
  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)

    const entryProperties = parseTextEntry(this.fsNode, this.subtree.indexFile)

    const pageContext = {
      title: entryProperties.title,
      slug: entryProperties.slug,
      permalink: this.permalink,
      outputPath: this.outputPath
    }

    Object.assign(this, {
      ...entryProperties,
      ...pageContext,
      context: this.context,
      attachments: this.subtree.attachments.map(attachmentNode => {
        return new models.Attachment(attachmentNode, {
          homepage: pageContext
        })
      })
    })
  }

  getPermalink() {
    return this.context.peek().permalink
  }

  getOutputPath() {
    return this.context.peek().outputPath
  }

  parseSubtree() {
    const tree = {
      indexFile: this.fsNode,
      attachments: []
    }

    if (!this.fsNode.children || !this.fsNode.children.length) {
      return tree
    }

    const indexFileNameOptions = ['index']

    const matchers = {
      indexFile: (fsNode) => {
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

    this.fsNode.children.forEach(childNode => {
      if (matchers.indexFile(childNode, indexFileNameOptions)) {
        tree.indexFile = childNode
        return
      }
      if (matchers.attachment(childNode)) {
        tree.attachments.push(childNode)
      }
    })

    return tree
  }

  afterEffects(contentModel) {
    this.attachments.forEach(attachment => {
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
        this.attachments.map(attachment => {
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
