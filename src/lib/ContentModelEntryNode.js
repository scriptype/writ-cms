const { join } = require('path')
const makeSlug = require('slug')
const { makePermalink } = require('./contentModelHelpers')
const { parseTextEntry } = require('./parseTextEntry')
const ContentModelNode = require('./ContentModelNode')

class ContentModelEntryNode extends ContentModelNode {
  constructor(fsNode, context, settings = {}) {
    super(fsNode, context, settings)

    this.indexFile = this.getIndexFile()

    const isFlatData = !fsNode.stats?.birthtime
    const entryProperties = parseTextEntry(
      this.fsNode,
      this.indexFile || this.fsNode,
      isFlatData
    )

    Object.assign(this, entryProperties)

    this.slug = this.getSlug()
    this.permalink = this.getPermalink()
    this.outputPath = this.getOutputPath()
    this.subtree = {}
  }

  getIndexFile() {
    return this.fsNode
  }

  getSlug() {
    return this.slug
  }

  getPermalink() {
    return makePermalink(
      this.context.peek().permalink,
      this.slug
    ) + (this.hasIndex ? '' : '.html')
  }

  getOutputPath() {
    return join(
      this.context.peek().outputPath,
      this.slug
    )
  }

  getSubtreeMatchers() {
    return {}
  }

  parseSubtree() {
    return {}
  }

  afterEffects(contentModel) {}

  render(renderer) {}
}

module.exports = ContentModelEntryNode
