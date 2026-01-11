const { join } = require('path')
const ContentModelEntryNode = require('../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../lib/contentModelHelpers')
const matcha = require('../../lib/matcha')

const models = {
  Attachment: require('./attachment')
}

const defaultSettings = {
  homepageDirectory: 'homepage'
}
class Homepage extends ContentModelEntryNode {
  static serialize(homepage) {
    return {
      ...homepage,
      ...homepage.serializeLinks(),
      attachments: homepage.subtree.attachments.map(models.Attachment.serialize)
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.contextKey = 'homepage'
    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      attachments: []
    })
  }

  getPermalink() {
    return this.context.peek().permalink
  }

  getOutputPath() {
    return this.context.peek().outputPath
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: ['homepage', 'home', 'index']
      })
    ) || this.fsNode
  }

  getSubtreeConfig() {
    return [{
      key: 'attachments',
      model: models.Attachment,
      matcher: matcha.true()
    }]
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
