const { join, resolve } = require('path')
const { isTemplateFile } = require('../helpers')
const models = {
  _baseEntry: require('./_baseEntry')
}

const defaultSettings = {
  homepageDirectory: 'homepage'
}
module.exports = function homepage(settings = defaultSettings) {
  const indexFileNameOptions = ['homepage', 'home', 'index']
  const folderNameOptions = [settings.homepageDirectory, 'homepage', 'home']

  const isHomepageFile = (node) => {
    return (
      isTemplateFile(node) &&
      node.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\..+$`)
      )
    )
  }

  const isHomepageDirectory = (node) => {
    return (
      node.children?.find(isHomepageFile) &&
      node.name.match(
        new RegExp(`^(${folderNameOptions.join('|')})$`)
      )
    )
  }

  return {
    match: node => isHomepageFile(node) || isHomepageDirectory(node),
    create: (node, context) => {
      const baseEntryProps = models._baseEntry(node, indexFileNameOptions)

      const pageContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink: context.root.permalink,
        outputPath: context.root.outputPath
      }

      return {
        ...baseEntryProps,
        ...pageContext,
        context,
        attachments: baseEntryProps.attachments.map(a => a({
          homepage: pageContext
        }))
      }
    }
  }
}
