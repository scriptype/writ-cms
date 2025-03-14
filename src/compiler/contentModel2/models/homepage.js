const settings = require('../../../settings').getSettings()
const models = {
  _baseEntry: require('./_baseEntry')
}

function homepage(node) {
  const baseEntryProps = models._baseEntry(node, ['index'])

  const permalink = settings.permalinkPrefix

  const pageContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink
  }

  return {
    ...baseEntryProps,
    attachments: baseEntryProps.attachments.map(a => a({
      page: pageContext
    })),
    permalink
  }
}

module.exports = homepage
