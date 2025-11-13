const _ = require('lodash')
const frontMatter = require('front-matter')
const slug = require('slug')
const { templateExtensions, removeExtension, Markdown } = require('../helpers')

const models = {
  Attachment: require('./attachment')
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

function parseFolderedEntry(node, indexFileNameOptions, matchers) {
  const tree = {
    indexFile: null,
    __attachmentNodes: []
  }
  node.children.forEach(childNode => {
    if (isIndexFile(childNode, indexFileNameOptions)) {
      tree.indexFile = childNode
      return
    }
    if (matchers.attachment(childNode)) {
      tree.__attachmentNodes.push(childNode)
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

function _baseEntry(node, indexFileNameOptions, matchers) {
  const folderedEntry = node.children ?
    parseFolderedEntry(node, indexFileNameOptions, matchers) :
    undefined
  const entryFile = folderedEntry?.indexFile || node
  const { attributes, body } = frontMatter(entryFile.content)
  const entryName = folderedEntry ? node.name : removeExtension(entryFile.name)
  const __attachmentNodes = folderedEntry?.__attachmentNodes || []
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
    __attachmentNodes
  }
}

module.exports = _baseEntry
