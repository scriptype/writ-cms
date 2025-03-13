const settings = require('../../../settings').getSettings()
const models = {
  _baseEntry: require('./_baseEntry')
}

function homepage(node) {
  const baseEntryProps = models._baseEntry(node, ['index'])
  return {
    ...baseEntryProps,
    permalink: settings.permalinkPrefix
  }
}

module.exports = homepage
