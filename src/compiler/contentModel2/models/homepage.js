const { join } = require('path')
const Settings = require('../../../settings')
const models = {
  _baseEntry: require('./_baseEntry')
}

function homepage(node) {
  const settings = Settings.getSettings()

  const baseEntryProps = models._baseEntry(node, ['index'])

  const permalink = settings.permalinkPrefix

  const outputPath = join(settings.out, 'index.html')

  const pageContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink,
    outputPath
  }

  return {
    ...baseEntryProps,
    ...pageContext,
    attachments: baseEntryProps.attachments.map(a => a({
      homepage: pageContext
    })),
    permalink
  }
}

module.exports = homepage
