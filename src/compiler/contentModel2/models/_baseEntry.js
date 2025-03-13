const frontMatter = require('front-matter')
const slug = require('slug')
const {
  templateExtensions,
  isTemplateFile,
  removeExtension
} = require('../helpers')

const models = {
  attachment: require('./attachment')
}

function _baseEntry(node, indexFileNameOptions) {
  const dotlessTemplateExtensions = templateExtensions.map(e => e.substring(1))
  const entryFile = node.children ?
    node.children.find(child => {
      return isTemplateFile(child) && child.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\.(${dotlessTemplateExtensions.join('|')})$`, 'i')
      )
    }) :
    node

  const attachments = (node.children || [])
    .filter(child => child !== entryFile)
    .map(child => models.attachment(child))

  const { attributes, body } = frontMatter(entryFile.content)

  return {
    ...node,
    ...attributes,
    title: attributes.title || removeExtension(node.children ? node.name : entryFile.name),
    slug: attributes.slug || slug(removeExtension(node.children ? node.name : entryFile.name), '-'),
    content: body || '',
    attachments
  }
}

module.exports = _baseEntry
