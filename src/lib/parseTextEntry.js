const _ = require('lodash')
const frontMatter = require('front-matter')
const slug = require('slug')
const { removeExtension, Markdown } = require('./contentModelHelpers')

const parseContent = (node, content) => {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

const normalizeEntryName = (fsNode, indexNode) => {
  const hasIndex = fsNode !== indexNode
  const entryName = hasIndex ? fsNode.name : removeExtension(indexNode.name)
  return {
    hasIndex,
    entryName
  }
}

const parseFlatData = (data) => {
  const contentRaw = data.content || ''
  const content = Markdown.parse(contentRaw)

  return {
    ...data,
    hasIndex: false,
    title: data.title || '',
    slug: data.slug || slug(data.title),
    contentRaw,
    content
  }
}

const parseTextEntry = (fsNode, indexNode, isFlatData) => {
  if (isFlatData) {
    return parseFlatData(fsNode)
  }
  const { attributes, body } = frontMatter(indexNode.content)
  const { hasIndex, entryName } = normalizeEntryName(fsNode, indexNode)
  const contentRaw = body || ''
  const content = parseContent(indexNode, contentRaw)

  return {
    ..._.omit(fsNode, 'children'),
    ...attributes,
    hasIndex,
    title: attributes.title || entryName,
    slug: attributes.slug || slug(entryName),
    contentRaw,
    content
  }
}

module.exports = {
  parseContent,
  normalizeEntryName,
  parseFlatData,
  parseTextEntry
}
