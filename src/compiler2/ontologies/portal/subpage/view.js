const { join } = require('path')
const marked = require('marked')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

marked.setOptions({
  headerIds: false
})

const MarkdownHelpers = {
  trimExtraParagraphAroundSeeMore(html) {
    const paragraphContainingSeeMore = html.match(/<p>(\s+|)\{\{seeMore\}\}(\s+|)<\/p>/s)
    if (paragraphContainingSeeMore) {
      return html.replace(paragraphContainingSeeMore[0], '{{seeMore}}')
    }
    return html
  },

  unescapeHandlebarsExpressions(html) {
    // partial greater sign
    html = html.replace(/{{&gt;/g, '{{>')

    // helpers
    html = html.replace(/{{(.+)(?:&quot;|&#39;)(.+)(?:&quot;|&#39;)(.*)}}/g, '{{\$1"\$2"\$3}}')

    // partials
    html = html.replace(/{{>(.+)(?:&quot;|&#39;)(.+)(?:&quot;|&#39;).*}}/g, '{{>\$1"\$2"\$3}}')

    return html
  }
}

// Remove frontmatter from parsed content
const parseContent = (rawContent, format) => {
  if (format === 'markdown') {
    let compiledHTML = marked.parse(
      rawContent.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
    )
    compiledHTML = MarkdownHelpers.trimExtraParagraphAroundSeeMore(compiledHTML)
    compiledHTML = MarkdownHelpers.unescapeHandlebarsExpressions(compiledHTML)
    return compiledHTML
  }
  return rawContent
}

const renderSubpages = (Renderer, contentModel) => {
  const { out } = Settings.getSettings()
  const compilation = contentModel.subpages.map(subpage => {
    // console.log('rendering subpage', subpage, 'to', join(out, subpage.outputPath))
    return Renderer.render({
      template: `root/pages/subpage/${subpage.type}`,
      outputPath: join(out, subpage.outputPath),
      content: parseContent(subpage.content.data, subpage.format.data),
      data: {
        ...contentModel,
        subpage,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = renderSubpages
