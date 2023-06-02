const frontMatter = require('front-matter')
const marked = require('marked')

marked.setOptions({
  headerIds: false
})

const READ_MORE_DIVIDER = '{{seeMore}}'

const partialExtensions = ['.hbs', '.handlebars']
const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.html'
]

const getSummary = (content) => {
  return content.split(READ_MORE_DIVIDER)[0]
}

const getHTMLContent = (body, extension) => {
  if (/^(\.html|\.htm)$/i.test(extension)) {
    return body
  }
  if (/^(\.md|\.markdown|\.txt)$/i.test(extension)) {
    const compiledHTML = marked.parse(
      body.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
    )
    const paragraphContainingSeeMore = compiledHTML.match(/<p>(\s+|)\{\{seeMore\}\}(\s+|)<\/p>/s)
    if (paragraphContainingSeeMore) {
      return compiledHTML.replace(paragraphContainingSeeMore[0], '{{seeMore}}')
    }
    return compiledHTML
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

const matchesExtension = (extension, acceptedExtensions) => {
  if (!extension) {
    return false
  }
  return new RegExp(acceptedExtensions.join('|'), 'i').test(extension)
}

const isTemplate = ({ extension }) => matchesExtension(extension, templateExtensions)
const isPartial = ({ extension }) => matchesExtension(extension, partialExtensions)

const parseTemplate = ({ content, extension }) => {
  const { attributes, body } = frontMatter(content)
  const type = attributes.type || 'text'
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
  isPartial,
  parseTemplate
}
