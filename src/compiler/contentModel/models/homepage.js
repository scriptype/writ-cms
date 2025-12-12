const { join } = require('path')
const ContentModelEntryNode = require('../../../lib/ContentModelEntryNode')
const { templateExtensions } = require('../../../lib/contentModelHelpers')
const matcha = require('../../../lib/matcha')

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
      attachments: homepage.subtree.attachments.map(models.Attachment.serialize)
    }
  }

  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)
    this.matchers = this.getSubtreeMatchers()
    this.subtree = this.parseSubtree()
  }

  getIndexFile() {
    return this.fsNode.children?.find(
      matcha.templateFile({
        nameOptions: ['homepage', 'home', 'index']
      })
    ) || this.fsNode
  }

  getPermalink() {
    return this.context.peek().permalink
  }

  getOutputPath() {
    return this.context.peek().outputPath
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

    const childContext = {
      homepage: {
        title: this.title,
        slug: this.slug,
        permalink: this.permalink,
        outputPath: this.outputPath
      }
    }

    const childNodes = (this.fsNode.children || []).filter(node => node !== this.indexFile)

    childNodes.forEach(childNode => {
      if (this.matchers.attachment(childNode)) {
        tree.attachments.push(
          new models.Attachment(childNode, childContext)
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
