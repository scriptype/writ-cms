const frontMatter = require('front-matter')
const marked = require('marked')
const Dictionary = require('../../dictionary')

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
  if (!localAssets || !localAssets.length) {
    return summaryPart
  }
  localAssets.forEach(asset => {
    const assetName = asset.isFolder ? asset.name + '/' : asset.name
    const srcRe = new RegExp(`src=("|'|)(\.\/|)${assetName}`, 'g')
    summaryPart = summaryPart.replace(srcRe, `src="${permalink}/${assetName}`)
    const hrefRe = new RegExp(`href=("|'|)(\.\/|)${assetName}`, 'g')
    summaryPart = summaryPart.replace(hrefRe, `href="${permalink}/${assetName}`)
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
  const locale = Dictionary.locale
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

const parseTemplate = async (fsObject, cache, { localAssets, permalink, subpage } = {}) => {
  const { path, content, extension, stats } = fsObject
  const { attributes, body } = frontMatter(content)
  const type = attributes.type || (subpage ? 'subpage' : 'text')
  const HTMLContent = getHTMLContent(body, extension)
  let publishDate = stats.birthtime
  if (attributes.date) {
    publishDate = new Date(attributes.date)
  } else {
    const cached = await cache.find(path)
    const cachedDate = cached.get('date')
    if (cachedDate) {
      publishDate = new Date(cachedDate)
    }
  }
  return {
    type,
    content: HTMLContent,
    summary: getSummary(HTMLContent, localAssets, permalink),
    ...attributes,
    ...attachTags(attributes),
    ...attachDates({ publishDate }),
  }
}

module.exports = {
  isTemplate,
  parseTemplate
}
