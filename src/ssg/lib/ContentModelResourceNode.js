const { join } = require('path')
const _ = require('lodash')
const { makePermalink } = require('./contentModelHelpers')
const ContentModelNode = require('./ContentModelNode')

class ContentModelResourceNode extends ContentModelNode {
  constructor(fsNode, context, settings = {}) {
    super(fsNode, context, settings)
    this.permalink = this.getPermalink()
    this.outputPath = this.getOutputPath()
    this.subtreeMatchers = this.getSubtreeMatchers()
    this.subtree = this.parseSubtree()
  }

  getPermalink() {
    return makePermalink(
      ..._.compact([
        this.context.peek()?.permalink,
        this.fsNode.name
      ])
    )
  }

  getOutputPath() {
    return join(
      ..._.compact([
        this.context.peek()?.outputPath,
        this.fsNode.name
      ])
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

module.exports = ContentModelResourceNode
