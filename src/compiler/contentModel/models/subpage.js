const { join } = require('path')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../../lib/contentModelHelpers')
const matcha = require('../../../lib/matcha')

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
      attachments: subpage.subtree.attachments.map(models.Attachment.serialize)
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.subtree = this.parseSubtree()
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: ['page', 'index']
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

    const context = this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: 'page'
    })

    this.fsNode.children.forEach(childNode => {
      if (childNode === this.indexFile) {
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
