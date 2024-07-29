const frontMatter = require('front-matter')

module.exports = function parse(content) {
  const { attributes, body } = frontMatter(content)
  return {
    attributes,
    parsedContent: content
  }
}
