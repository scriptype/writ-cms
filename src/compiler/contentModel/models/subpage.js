const { join } = require('path')
const ContentModelNode = require('../../../lib/ContentModelNode')
const { templateExtensions, makePermalink } = require('../../../lib/contentModelHelpers')
const { parseTextEntry } = require('../../../lib/parseTextEntry')

const models = {
  _baseEntry: require('./_baseEntry'),
  collection: require('./collection'),
  Attachment: require('./attachment'),
}

const defaultSettings = {
  pagesDirectory: 'pages'
}
class Subpage extends ContentModelNode {
  constructor(fsNode, context, settings = defaultSettings) {
    super(fsNode, context, settings)

    const entryProperties = parseTextEntry(this.fsNode, this.subtree.indexFile)

    // re-call these because slug is only now ready to use :(
    this.permalink = this.getPermalink(entryProperties.slug, entryProperties.hasIndex)
    this.outputPath = this.getOutputPath(entryProperties.slug, entryProperties.hasIndex)

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
        return new models.Attachment(
          attachmentNode,
          this.context.push({
            ...pageContext,
            key: 'page'
          })
        )
      })
    })
  }

  getPermalink(slug, hasIndex) {
    return makePermalink(
      this.context.peek().permalink,
      this.slug || slug || ''
    ) + ((this.hasIndex || hasIndex) ? '' : '.html')
  }

  getOutputPath(slug, hasIndex) {
    return join(
      this.context.peek().outputPath,
      this.slug || slug || ''
    )
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
          subpage: this,
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
      renderSubpage(),
      renderAttachments()
    ])
  }
}

module.exports = Subpage
