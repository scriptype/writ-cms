const { join } = require('path')
const settings = require('../../../settings').getSettings()
const models = {
  _baseEntry: require('./_baseEntry')
}

function subpage(node) {
  const baseEntryProps = models._baseEntry(node, ['index', 'page'])

  const permalink = (
    settings.permalinkPrefix +
    baseEntryProps.slug +
    (node.children ? '' : '.html')
  )

  const outputPath = join(...[
    settings.out,
    baseEntryProps.slug,
    (node.children ? 'index' : '')
  ].filter(Boolean)) + '.html'

  const pageContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink
  }

  return {
    ...baseEntryProps,
    ...pageContext,
    outputPath,
    attachments: baseEntryProps.attachments.map(a => a({
      page: pageContext
    }))
  }
}

module.exports = subpage
