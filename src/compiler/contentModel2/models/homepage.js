const { join } = require('path')
const settings = require('../../../settings').getSettings()
const models = {
  _baseEntry: require('./_baseEntry')
}

function homepage(node) {
  const baseEntryProps = models._baseEntry(node, ['index'])

  const permalink = settings.permalinkPrefix

  const outputPath = join(settings.out, 'index.html')

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
    permalink,
    outputPath
  }
}

module.exports = homepage
