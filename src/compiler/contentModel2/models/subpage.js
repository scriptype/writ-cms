const settings = require('../../../settings').getSettings()
const models = {
  _baseEntry: require('./_baseEntry')
}

function subpage(node) {
  const baseEntryProps = models._baseEntry(node, ['index', 'page'])
  return {
    ...baseEntryProps,
    permalink: (
      settings.permalinkPrefix +
      baseEntryProps.slug +
      (node.children ? '' : '.html')
    )
  }
}

module.exports = subpage
