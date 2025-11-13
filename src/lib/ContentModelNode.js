const { join } = require('path')
const _ = require('lodash')
const { makePermalink } = require('./contentModelHelpers')

class ContentModelNode {
  constructor(fsNode, context, settings = {}) {
    this.fsNode = fsNode
    this.context = context
    this.settings = settings
    this.date = new Date(this.fsNode.stats?.birthtime || Date.now())
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

module.exports = ContentModelNode
