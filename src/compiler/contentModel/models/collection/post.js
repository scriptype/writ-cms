const { join } = require('path')
const makeSlug = require('slug')
const ContentModelNode = require('../../../../lib/ContentModelNode')
const { templateExtensions, makePermalink, Markdown } = require('../../../../lib/contentModelHelpers')
const { parseTextEntry } = require('../../../../lib/parseTextEntry')

const models = {
  facet: require('./facet'),
  Attachment: require('../attachment')
}

const defaultSettings = {
  entryAlias: undefined
}
class Post extends ContentModelNode {
  constructor(fsNode, context, contentTypes, settings = defaultSettings) {
    super(fsNode, context, settings)

    const isFlatData = !fsNode.stats?.birthtime
    const entryProperties = parseTextEntry(this.fsNode, this.subtree.indexFile, isFlatData)

    // re-call these because slug is only now ready to use :(
    this.permalink = this.getPermalink(entryProperties.slug, entryProperties.hasIndex)
    this.outputPath = this.getOutputPath(entryProperties.slug, entryProperties.hasIndex)

    const postContext = {
      title: entryProperties.title,
      slug: entryProperties.slug,
      permalink: this.permalink,
      outputPath: this.outputPath
    }

    const contentType = this.context.peek().entryContentType

    Object.assign(this, {
      ...entryProperties,
      ...postContext,
      context: this.context,
      contentType,
      schema: contentTypes.find(ct => ct.name === contentType),
      attachments: this.subtree.attachments.map(attachmentNode => {
        return new models.Attachment(
          attachmentNode,
          this.context.push({
            ...postContext,
            key: 'post'
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

    const indexFileNameOptions = [this.settings.entryAlias, 'post', 'index'].filter(Boolean)

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

  afterEffects(contentModel, collectionFacets) {
    // TODO: feels like collection should handle this
    models.facet().linkWithEntryFields(this, collectionFacets)

    this.attachments.forEach(attachment => {
      attachment.afterEffects(contentModel)
    })
  }

  render(renderer, { contentModel, settings, debug }) {
    const renderPost = () => {
      const data = {
        ...contentModel,
        post: this,
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
        this.attachments.map(attachment => {
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
