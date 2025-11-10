const _ = require('lodash')
const frontMatter = require('front-matter')
const slug = require('slug')
const { templateExtensions, removeExtension, Markdown } = require('../helpers')

const models = {
  attachment: require('./attachment')
}

const isIndexFile = (node, nameOptions) => {
  if (node.children) {
    return false
  }
  const names = nameOptions.join('|')
  const extensions = templateExtensions.join('|')
  const namePattern = new RegExp(`^(${names})(${extensions})$`, 'i')
  return node.name.match(namePattern)
}

function parseFolderedEntry(node, indexFileNameOptions) {
  const tree = {
    indexFile: null,
    attachments: []
  }
  const subModels = {
    attachment: models.attachment()
  }
  node.children.forEach(childNode => {
    if (isIndexFile(childNode, indexFileNameOptions)) {
      tree.indexFile = childNode
      return
    }
    if (subModels.attachment.match(childNode)) {
      tree.attachments.push(subModels.attachment.create.bind(null, childNode))
    }
  })
  return tree
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

function _baseEntry(node, indexFileNameOptions) {
  const folderedEntry = node.children ?
    parseFolderedEntry(node, indexFileNameOptions) :
    undefined
  const entryFile = folderedEntry?.indexFile || node
  const { attributes, body } = frontMatter(entryFile.content)
  const entryName = folderedEntry ? node.name : removeExtension(entryFile.name)
  const attachments = folderedEntry?.attachments || []
  const contentRaw = body || ''
  const content = parseContent(entryFile, contentRaw)

  return {
    ..._.omit(node, 'children'),
    ...attributes,
    hasIndex: !!folderedEntry,
    title: attributes.title || entryName,
    slug: attributes.slug || slug(entryName),
    contentRaw,
    content,
    attachments
  }
}

module.exports = _baseEntry
