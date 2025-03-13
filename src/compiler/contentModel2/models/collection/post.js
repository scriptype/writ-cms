const settings = require('../../../../settings').getSettings()
const { parseTags } = require('../../helpers')
const models = {
  _baseEntry: require('../_baseEntry'),
  tag: require('./tag')
}

function post(node, context) {
  const baseEntryProps = models._baseEntry(node, ['index', 'post'])
  return {
    ...baseEntryProps,
    context,
    contentType: baseEntryProps.contentType || context.category.childContentType,
    tags: parseTags(baseEntryProps.tags).map(tagName => {
      return models.tag(tagName, context)
    }),
    date: new Date(baseEntryProps.date || baseEntryProps.stats.birthtime || Date.now()),
    permalink: (
      settings.permalinkPrefix +
      [
        context.collection.slug,
        context.category.isDefaultCategory ? '' : context.category.slug,
        baseEntryProps.slug
      ].filter(Boolean).join('/') +
      (node.children ? '' : '.html')
    )
  }
}

module.exports = post
