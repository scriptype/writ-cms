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

  const pageContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink
  }

  return {
    ...baseEntryProps,
    ...pageContext,
    attachments: baseEntryProps.attachments.map(a => a({
      page: pageContext
    }))
  }
}

module.exports = subpage
