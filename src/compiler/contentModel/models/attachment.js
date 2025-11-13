const ContentModelNode = require('../../../lib/ContentModelNode')

class Attachment extends ContentModelNode {
  constructor(fsNode, context) {
    super(fsNode, context)
  }

  render(renderer) {
    return renderer.copy({
      src: this.fsNode.absolutePath,
      dest: this.outputPath,
      recursive: !!this.fsNode.children
    })
  }
}

module.exports = Attachment
