const marked = require('marked')
const frontMatter = require('front-matter')

const helpers = {
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

module.exports = function parse(content, options = {}) {
  const { attributes, body } = frontMatter(content)

  marked.setOptions({
    headerIds: false,
    ...options
  })

  let compiledHTML = marked.parse(
    body.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
  )
  compiledHTML = helpers.trimExtraParagraphAroundSeeMore(compiledHTML)
  compiledHTML = helpers.unescapeHandlebarsExpressions(compiledHTML)

  return {
    attributes,
    parsedContent: compiledHTML
  }
}
