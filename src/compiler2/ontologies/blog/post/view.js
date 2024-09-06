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

const renderPost = (Renderer, post, rootModel) => {
  const { out } = Settings.getSettings()
  console.log(`


  *   *   *   *
  RENDER POST
  *   *   *   *



  `)
  return Renderer.render({
    template: `pages/blog/post/${post.type}`,
    outputPath: join(out, (post.outputPrefix || ''), post.outputPath),
    content: parseContent(post.content.data, post.format.data),
    data: {
      ...rootModel,
      post,
      settings: Settings.getSettings(),
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderPost
