const { join } = require('path')
const { isTemplateFile, parseArray } = require('../../helpers')
const models = {
  _baseEntry: require('../_baseEntry'),
  tag: require('./tag')
}

const defaultSettings = {
  entryAlias: undefined
}
module.exports = function post(settings = defaultSettings) {
  const indexFileNameOptions = [settings.entryAlias, 'post', 'index'].filter(Boolean)

  const isPostIndexFile = (node) => {
    return (
      isTemplateFile(node) &&
      node.name.match(
        new RegExp(`^${indexFileNameOptions.join('|')}\..+$`)
      )
    )
  }

  return {
    match: (node) => isTemplateFile(node) || node.children?.find(isPostIndexFile),
    create: (node, context) => {
      const baseEntryProps = models._baseEntry(node, indexFileNameOptions)

      const permalink = [
        context.category.permalink,
        baseEntryProps.slug
      ].join('/') + (node.children ? '' : '.html')

      const outputPath = join(context.category.outputPath, baseEntryProps.slug)

      const postContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink,
        outputPath,
      }

      return {
        ...baseEntryProps,
        ...postContext,
        context,
        contentType: context.collection.entryContentType,
        tags: parseArray(baseEntryProps.tags).map(tagName => {
          return models.tag(tagName, context)
        }),
        date: new Date(baseEntryProps.date || baseEntryProps.stats.birthtime || Date.now()),
        attachments: baseEntryProps.attachments.map(a => a({
          ...context,
          post: postContext
        }))
      }
    }
  }
}
