const { join, resolve } = require('path')
const { isTemplateFile } = require('../helpers')
const models = {
  _baseEntry: require('./_baseEntry')
}

const defaultSettings = {
  pagesDirectory: 'pages'
}
module.exports = function subpage(settings = defaultSettings) {
  const indexFileNameOptions = ['page', 'index']
  const pagesDirectoryNameOptions = [settings.pagesDirectory, 'subpages', 'pages']

  const isSubpageIndexFile = (node) => {
    return (
      isTemplateFile(node) &&
      node.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\..+$`)
      )
    )
  }

  const isFolderedSubpage = (node) => {
    return node.children?.find(isSubpageIndexFile)
  }

  const isPagesDirectory = (node) => {
    return (
      node.children &&
      node.name.match(
        new RegExp(`^(${pagesDirectoryNameOptions.join('|')})$`)
      )
    )
  }

  return {
    match: node => isTemplateFile(node) || isFolderedSubpage(node),
    matchPagesDirectory: node => isPagesDirectory(node),
    create: (node, context) => {
      const baseEntryProps = models._baseEntry(node, indexFileNameOptions)

      const permalink = (
        context.root.permalink +
        baseEntryProps.slug +
        (baseEntryProps.hasIndex ? '' : '.html')
      )

      const outputPath = join(context.root.outputPath, baseEntryProps.slug)

      const pageContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink,
        outputPath
      }

      return {
        ...baseEntryProps,
        ...pageContext,
        context,
        attachments: baseEntryProps.attachments.map(a => a({
          page: pageContext
        }))
      }
    }
  }
}
