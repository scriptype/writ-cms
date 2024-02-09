const frontMatter = require('front-matter')
const marked = require('marked')

marked.setOptions({
  headerIds: false
})

const READ_MORE_DIVIDER = '{{seeMore}}'

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

const parseTags = (tags = []) => {
  return typeof tags === 'string' ?
    tags.split(',').map(t => t.trim()) :
    tags
}

const parseTemplate = (fsObject, { localAssets, permalink } = {}) => {
  const { content, extension } = fsObject
  const { attributes, body } = frontMatter(content)
  const { type, title, tags, ...restAttributes } = attributes
  const HTMLContent = getHTMLContent(body, extension)
  const metadata = {
    type,
    title,
    content: HTMLContent,
    summary: getSummary(HTMLContent, localAssets, permalink),
    tags: parseTags(tags),
    publishDate: attributes.date ? new Date(attributes.date) : null
  }
  return {
    ...metadata,
    attributes: restAttributes
  }
}

module.exports = parseTemplate
