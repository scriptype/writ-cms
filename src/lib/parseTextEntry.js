const _ = require('lodash')
const frontMatter = require('front-matter')
const slug = require('slug')
const { removeExtension, Markdown } = require('./contentModelHelpers')

const LINKED_FIELD_SYNTAX = /^\+[^ ]+$/

const parseLinkValue = (value) => {
  return value.replace(/^\+/g, '').split('/').filter(Boolean)
}

const parseLinkedFields = (object) => {
  Object.keys(_.cloneDeep(object)).forEach(key => {
    const value = object[key]
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (!LINKED_FIELD_SYNTAX.test(value[i])) {
          continue
        }
        object[key][i] = {
          key,
          linkPath: parseLinkValue(value[i])
        }
      }
    } else {
      if (!LINKED_FIELD_SYNTAX.test(value)) {
        return
      }
      object[key] = {
        key,
        linkPath: parseLinkValue(value)
      }
    }
  })
  return object
}

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
  const title = data.title || ''

  return {
    ...data,
    hasIndex: false,
    title,
    slug: data.slug || slug(title),
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
  const content = indexNode.children ? '' : parseContent(indexNode, contentRaw)

  return {
    ..._.omit(fsNode, 'children'),
    ...attributes,
    ...parseLinkedFields(attributes),
    __originalAttributes__: attributes,
    hasIndex,
    title: attributes.title || entryName,
    slug: attributes.slug || slug(entryName),
    contentRaw,
    content
  }
}

module.exports = {
  parseLinkValue,
  parseLinkedFields,
  parseContent,
  normalizeEntryName,
  parseFlatData,
  parseTextEntry
}
