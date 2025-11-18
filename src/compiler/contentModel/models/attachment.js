const ContentModelResourceNode = require('../../../lib/ContentModelResourceNode')

class Attachment extends ContentModelResourceNode {
  static serialize(attachment) {
    return attachment
  }

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
