const { join, resolve } = require('path')
const models = {
  _baseEntry: require('./_baseEntry')
}

const defaultSettings = {
  permalinkPrefix: '/',
  out: resolve('.'),
  homepageDirectory: 'homepage'
}
function homepage(node, settings = defaultSettings) {
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
