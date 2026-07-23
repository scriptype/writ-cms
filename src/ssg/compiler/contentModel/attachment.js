const ContentModelResourceNode = require('../../lib/ContentModelResourceNode')

class Attachment extends ContentModelResourceNode {
  static serialize(attachment) {
    return attachment
  }

  constructor(fsNode, context, schema, settings) {
    super(fsNode, context, schema, settings)
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
