const { extname } = require('path')

const READ_MORE_DIVIDER = '{{seeMore}}'
const EXTENSION_PATTERN = /\.hbs|\.handlebars/i

const getMetaBlock = (content) => {
  const metaBlock = content.match(/\{\{.*\n.*=".*"\n\}\}/gs)
  return metaBlock ? metaBlock[0] : ''
}

const getContent = (content) => {
  const contentSection = content.match(/\n\}\}\n(.*)\{\{\/.*\}\}\n$/s)
  return contentSection ? contentSection[1] : ''
}

const getSummary = (content) => {
  const indexOfReadMore = content.indexOf(READ_MORE_DIVIDER)
  if (indexOfReadMore === -1) {
    return content
  }
  return content.substring(0, indexOfReadMore)
}

const getPartialType = (content, metaBlock) => {
  const partialType = (metaBlock || getMetaBlock(content)).match(/\{\{#>(.*)/)
  return partialType ? partialType[1].trim() : 'text-post'
}

const getMetadata = (content, metaBlock) => {
  const metadata = (metaBlock || getMetaBlock(content)).match(/.*=.*/g)
  if (!metadata) {
    return {}
  }
  return metadata.map(s => s
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
  const extension = extname(path)
  return EXTENSION_PATTERN.test(extension)
}

module.exports = {
  READ_MORE_DIVIDER,
  EXTENSION_PATTERN,
  getMetaBlock,
  getContent,
  getPartialType,
  getMetadata,
  parseTemplate,
  isTemplate
}
