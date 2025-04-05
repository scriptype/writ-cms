const { join, resolve } = require('path')
const models = {
  _baseEntry: require('./_baseEntry')
}

const defaultSettings = {
  permalinkPrefix: '/',
  out: resolve('.'),
  pagesDirectory: 'pages'
}
function subpage(node, settings = defaultSettings) {
  const baseEntryProps = models._baseEntry(node, ['index', 'page'])

  const permalink = (
    settings.permalinkPrefix +
    baseEntryProps.slug +
    (node.children ? '' : '.html')
  )

  const outputPath = join(settings.out, baseEntryProps.slug)

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
      page: pageContext
    }))
  }
}

module.exports = subpage
