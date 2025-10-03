const marked = require('marked')

const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.text',
  '.html'
]

const isTemplateFile = (node) => {
  return new RegExp(templateExtensions.join('|'), 'i').test(node.extension)
}

const removeExtension = (fileName) => {
  if (fileName.lastIndexOf('.') > 0) {
    return fileName.replace(/(\.[^.]+)?$/, '')
  }
  return fileName
}

const makePermalink = (...parts) => {
  if (parts[0] === '/') {
    return parts[0] + parts.slice(1).join('/')
  }
  return parts.filter(Boolean).join('/')
}

const makeDateSlug = (date) => {
  return date.toISOString().split('T')[0]
}

const _sortableValue = (value) => {
  return typeof value === 'string' ? value.charCodeAt(0) * -1 : value
}

const sort = (items, sortBy, sortOrder) => {
  items.sort((a, b) => {
    const sortableA = _sortableValue(a[sortBy])
    const sortableB = _sortableValue(b[sortBy])
    if (sortOrder === -1) {
      return sortableA - sortableB
    }
    return sortableB - sortableA
  })
}

const Markdown = {
  parse(text) {
    return Markdown.unescapeHandlebarsExpressions(
      marked.parse(
        text.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
      )
    )
  },

  unescapeHandlebarsExpressions(html) {
    // partial greater sign
    html = html.replace(/{{&gt;/g, '{{>')
    // helpers
    html = html.replace(/{{(.+)(?:&quot;|&#39;)(.+)(?:&quot;|&#39;)(.*)}}/g, '{{\$1"\$2"\$3}}')
    // partials
    html = html.replace(/{{>(.+)(?:&quot;|&#39;)(.+)(?:&quot;|&#39;).*}}/g, '{{>\$1"\$2"\$3}}')
    return html
  },
}

module.exports = {
  templateExtensions,
  isTemplateFile,
  removeExtension,
  makePermalink,
  makeDateSlug,
  sort,
  Markdown
}
