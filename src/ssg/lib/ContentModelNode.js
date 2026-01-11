class ContentModelNode {
  constructor(fsNode, context, settings = {}) {
    this.fsNode = fsNode
    this.context = context
    this.settings = settings
    this.title = this.fsNode.name
    this.date = new Date(this.fsNode.stats?.birthtime || Date.now())
  }
}

module.exports = ContentModelNode
