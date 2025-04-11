const { join } = require('path')
const _ = require('lodash')

module.exports = function Attachment() {
  return {
    match: node => true,

    create(node, context) {
      const permalink = _.compact([
        context.peek()?.permalink,
        node.name
      ]).join('/')

      const outputPath = join(
        ..._.compact([
          context.peek()?.outputPath,
          node.name
        ])
      )

      return {
        ...node,
        context,
        permalink,
        outputPath,
        date: new Date(node.stats.birthtime || Date.now())
      }
    },

    render: (renderer, attachment) => {
      return renderer.copy({
        src: attachment.absolutePath,
        dest: attachment.outputPath,
        recursive: !!attachment.children
      })
    }
  }
}
