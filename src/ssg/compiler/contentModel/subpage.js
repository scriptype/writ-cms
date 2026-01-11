const { join } = require('path')
const ContentModelEntryNode = require('../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../lib/contentModelHelpers')
const matcha = require('../../lib/matcha')

const models = {
  Attachment: require('./attachment'),
}

const defaultSettings = {
  pagesDirectory: 'pages'
}
class Subpage extends ContentModelEntryNode {
  static serialize(subpage) {
    return {
      ...subpage,
      ...subpage.serializeLinks(),
      attachments: subpage.subtree.attachments.map(models.Attachment.serialize)
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.contextKey = 'page'
    this.subtreeConfig = this.getSubtreeConfig()
    this.subtree = this.parseSubtree({
      attachments: []
    })
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: ['page', 'index']
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
