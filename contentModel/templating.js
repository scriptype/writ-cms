const marked = require('marked')
const frontMatter = require('front-matter')

const READ_MORE_DIVIDER = '{{seeMore}}'

const acceptedExtensionsForTemplates = [
  '.hbs',
  '.md',
  '.markdown',
  '.txt',
  '.html'
]

// Tries to get the first paragraph
const getSummary = (content) => {
  return content.split(READ_MORE_DIVIDER)[0]
}

const getHTMLContent = (body, extension) => {
  if (/^(\.html|\.htm)$/i.test(extension)) {
    return body
  }
  if (/^(\.md|\.markdown|\.txt)$/i.test(extension)) {
    return marked.parse(
      body.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
    )
  }
  return body
}

const attachDates = ({ date = '2022-11-12, 02:04', ...rest }) => {
  const locale = 'en-US'
  const publishedAt = new Date(date)
  const publishedAtFull = publishedAt.toLocaleString(locale, { dateStyle: 'full' })
  const publishedAtLong = publishedAt.toLocaleString(locale, { dateStyle: 'long' })
  const publishedAtMedium = publishedAt.toLocaleString(locale, { dateStyle: 'medium' })
  const publishedAtShort = publishedAt.toLocaleString(locale, { dateStyle: 'short' })
  return {
    publishedAt,
    publishedAtFull,
    publishedAtLong,
    publishedAtMedium,
    publishedAtShort
  }
}

const attachTags = ({ tags }) => {
  if (!tags) {
    return {
      tags: []
    }
  }
  return {
    tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
  }
}

const isTemplate = ({ extension }) => {
  if (!extension) {
    return false
  }
  const extensions = acceptedExtensionsForTemplates.join('|')
  const pattern = new RegExp(extensions, 'i')
  return pattern.test(extension)
}

const parseTemplate = ({ content, extension }) => {
  const { attributes, body } = frontMatter(content)
  const type = attributes.type || 'text-post'
  const HTMLContent = getHTMLContent(body, extension)
  return {
    type,
    content: HTMLContent,
    summary: getSummary(HTMLContent),
    ...attributes,
    ...attachTags(attributes),
    ...attachDates(attributes),
  }
}

module.exports = {
  isTemplate,
  parseTemplate
}
