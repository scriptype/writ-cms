const { extname } = require('path')

const READ_MORE_DIVIDER = '{{seeMore}}'

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

const attachTags = ({ tags, ...rest }) => {
  return {
    ...rest,
    tags: (tags ? tags.split(',') : []).map(t => t.trim())
  }
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

const getMetadata = (metaBlock) => {
  const metadata = metaBlock.match(/.*=.*/g)
  if (!metadata) {
    return {}
  }
  const frontMatter = metadata.map(s => s
      .trim()
      .split('=')
      .map(k => k.replace(/"/g, ''))
    )
    .reduce((acc, tuple) => ({
      ...acc,
      [tuple[0]]: tuple[1]
    }), {})

  return {
    ...frontMatter,
    ...attachDates(frontMatter),
    ...attachTags(frontMatter)
  }
}

const getPartialType = (metaBlock) => {
  const partialType = metaBlock.match(/\{\{#>(.*)/)
  return {
    type: partialType ? partialType[1].trim() : 'text-post'
  }
}

const parseTemplate = (fileContent = '') => {
  const metaBlock = getMetaBlock(fileContent)
  const content = getContent(fileContent)
  const summary = getSummary(content)
  return {
    ...getMetadata(metaBlock),
    ...getPartialType(metaBlock),
    content,
    summary
  }
}

module.exports = {
  parseTemplate
}
