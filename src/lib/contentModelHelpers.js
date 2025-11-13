const _ = require('lodash')
const marked = require('marked')
const frontMatter = require('front-matter')
const slug = require('slug')

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

const makePermalink = (...parts) => {
  if (parts[0] === '/') {
    return parts[0] + parts.slice(1).join('/')
  }
  return parts.filter(Boolean).join('/')
}

const removeExtension = (fileName) => {
  if (fileName.lastIndexOf('.') > 0) {
    return fileName.replace(/(\.[^.]+)?$/, '')
  }
  return fileName
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
  makePermalink,
  removeExtension,
  Markdown
}
