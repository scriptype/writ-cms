const { join } = require('path')
const Settings = require('../../../settings')
const models = {
  _baseEntry: require('./_baseEntry')
}

function homepage(node) {
  const settings = Settings.getSettings()

  const baseEntryProps = models._baseEntry(node, ['index', 'homepage', 'home'])

  const pageContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink: settings.permalinkPrefix,
    outputPath: settings.out
  }

  return {
    ...baseEntryProps,
    ...pageContext,
    attachments: baseEntryProps.attachments.map(a => a({
      homepage: pageContext
    }))
  }
}

module.exports = homepage
