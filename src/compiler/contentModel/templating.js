const frontMatter = require('front-matter')
const marked = require('marked')

marked.setOptions({
  headerIds: false
})

const READ_MORE_DIVIDER = '{{seeMore}}'

const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.html'
]

const MarkdownHelpers = {
  trimExtraParagraphAroundSeeMore(html) {
    const paragraphContainingSeeMore = html.match(/<p>(\s+|)\{\{seeMore\}\}(\s+|)<\/p>/s)
    if (paragraphContainingSeeMore) {
      return html.replace(paragraphContainingSeeMore[0], '{{seeMore}}')
    }
    return html
  },

  unescapePartialUsage(html) {
    // partial greater sign
    html = html.replace(/\{\{\&gt;/g, '{{>')

    // helper double quotes
    html = html.replace(/\{\{(.+)&quot;(.+)&quot;(.+)\}\}/g, '{{\$1"\$2"\$3}}')

    // helper single quotes
    html = html.replace(/\{\{(.+)&#39;(.+)&#39;(.+)\}\}/g, "{{\$1'\$2'\$3}}")

    // partial double quotes
    html = html.replace(/\{\{>(.+)&quot;(.+)&quot;(.+|)\}\}/g, '{{>\$1"\$2"\$3}}')

    // partial single quotes
    html = html.replace(/\{\{>(.+)&#39;(.+)&#39;(.+|)\}\}/g, "{{>\$1'\$2'\$3}}")
    return html
  }
}


const getSummary = (content, localAssets, permalink) => {
  let summaryPart = content.split(READ_MORE_DIVIDER)[0]
  if (!localAssets) {
    return summaryPart
  }
  localAssets.forEach(asset => {
    const srcRe = new RegExp(`src=("|'|)(\.\/|)${asset.name}("|'|)`, 'g')
    summaryPart = summaryPart.replace(srcRe, `src="${permalink}/${asset.name}"`)
    const hrefRe = new RegExp(`href=("|'|)(\.\/|)${asset.name}("|'|)`, 'g')
    summaryPart = summaryPart.replace(hrefRe, `href="${permalink}/${asset.name}"`)
  })
  return summaryPart
}

const getHTMLContent = (body, extension) => {
  if (/^(\.html|\.htm)$/i.test(extension)) {
    return body
  }
  if (/^(\.md|\.markdown|\.txt)$/i.test(extension)) {
    let compiledHTML = marked.parse(
      body.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
    )
    compiledHTML = MarkdownHelpers.trimExtraParagraphAroundSeeMore(compiledHTML)
    compiledHTML = MarkdownHelpers.unescapePartialUsage(compiledHTML)
    return compiledHTML
  }
  return body
}

const attachDates = ({ publishDate }) => {
  const locale = 'en-US'
  const publishDateFull = publishDate.toLocaleString(locale, { dateStyle: 'full' })
  const publishDateLong = publishDate.toLocaleString(locale, { dateStyle: 'long' })
  const publishDateMedium = publishDate.toLocaleString(locale, { dateStyle: 'medium' })
  const publishDateShort = publishDate.toLocaleString(locale, { dateStyle: 'short' })
  return {
    publishDate,
    publishDateFull,
    publishDateLong,
    publishDateMedium,
    publishDateShort
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

const parseTemplate = ({ isSubpage, ...fsObject }) => {
  const { content, extension, stats, localAssets, permalink } = fsObject
  const { attributes, body } = frontMatter(content)
  const type = attributes.type || (isSubpage ? 'subpage' : 'text')
  const HTMLContent = getHTMLContent(body, extension)
  return {
    type,
    content: HTMLContent,
    summary: getSummary(HTMLContent, localAssets, permalink),
    ...attributes,
    ...attachTags(attributes),
    ...attachDates({
      publishDate: attributes.date ? new Date(attributes.date) : stats.birthtime
    }),
  }
}

module.exports = {
  isTemplate,
  parseTemplate
}
