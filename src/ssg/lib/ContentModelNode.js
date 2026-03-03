class ContentModelNode {
  constructor(fsNode, context, settings = {}) {
    this.fsNode = fsNode
    this.context = context
    this.settings = settings
    this.title = this.fsNode.name
    this.date = new Date(this.fsNode.stats?.birthtime || Date.now())
  }

  // Shallow copy that preserves the prototype without re-running the constructor
  clone() {
    const prototype = Object.getPrototypeOf(this)
    const shell = Object.create(prototype)
    return Object.assign(shell, this)
  }
}

module.exports = ContentModelNode
