const { extname } = require('path')

const READ_MORE_DIVIDER = '{{seeMore}}'
const EXTENSION = '.hbs'

const getMetaBlock = (content) => {
  return content.match(/\{\{.*\n.*=".*"\n\}\}/gs)[0]
}

const getContent = (content) => {
  return content.match(/\n\}\}\n(.*)\{\{\/.*\}\}\n$/s)[1]
}

const getSummary = (content) => {
  const indexOfReadMore = content.indexOf(READ_MORE_DIVIDER)
  if (indexOfReadMore === -1) {
    return content
  }
  return content.substring(0, indexOfReadMore)
}

const getPartialType = (content, metaBlock) => {
  return (metaBlock || getMetaBlock(content)).match(/\{\{#>(.*)/)[1].trim()
}

const getMetadata = (content, metaBlock) => {
  return (metaBlock || getMetaBlock(content))
    .match(/.*=.*/g)
    .map(s => s
      .trim()
      .split('=')
      .map(k => k.replace(/"/g, ''))
    )
    .reduce((acc, tuple) => ({
      ...acc,
      [tuple[0]]: tuple[1]
    }), {})
}

const parseTemplate = (content) => {
  const metaBlock = getMetaBlock(content)
  const contentSection = getContent(content)
  return {
    type: getPartialType(content, metaBlock),
    content: contentSection,
    metadata: getMetadata(content, metaBlock),
    summary: getSummary(contentSection)
  }
}

const isTemplate = (path) => {
  return extname(path) === EXTENSION
}

module.exports = {
  READ_MORE_DIVIDER,
  EXTENSION,
  getMetaBlock,
  getContent,
  getPartialType,
  getMetadata,
  parseTemplate,
  isTemplate
}
