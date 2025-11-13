const { isTemplateFile } = require('../../lib/contentModelHelpers')

module.exports = function createMatchers(settings) {
  const matchers = {
    homepageFile: fsNode => {
      const indexFileNameOptions = ['homepage', 'home', 'index']
      return (
        isTemplateFile(fsNode) &&
        fsNode.name.match(
          new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
        )
      )
    },

    homepageDirectory: fsNode => {
      const folderNameOptions = [settings.homepageDirectory, 'homepage', 'home']
      return (
        fsNode.children?.find(matchers.homepageFile) &&
        fsNode.name.match(
          new RegExp(`^(${folderNameOptions.join('|')})$`)
        )
      )
    },

    homepage: fsNode => {
      return matchers.homepageFile(fsNode) || matchers.homepageDirectory(fsNode)
    },

    collection: fsNode => {},

    category: fsNode => {},

    post: fsNode => {},

    isSubpageIndexFile: fsNode => {
      const indexFileNameOptions = ['page', 'index']
      return (
        isTemplateFile(fsNode) &&
        fsNode.name.match(
          new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
        )
      )
    },

    isFolderedSubpage: fsNode => {
      return fsNode.children?.find(matchers.isSubpageIndexFile)
    },

    subpage: fsNode => {
      return isTemplateFile(fsNode) || matchers.isFolderedSubpage(fsNode)
    },

    pagesDirectory: fsNode => {
      const pagesDirectoryNameOptions = [settings.pagesDirectory, 'subpages', 'pages']
      return (
        fsNode.children &&
        fsNode.name.match(
          new RegExp(`^(${pagesDirectoryNameOptions.join('|')})$`)
        )
      )
    },

    attachment: fsNode => true,

    asset: fsNode => true,

    assetsDirectory: fsNode => {
      const assetsDirectoryNameOptions = [settings.assetsDirectory, 'assets']

      return (
        fsNode.children &&
        fsNode.name.match(
          new RegExp(`^(${assetsDirectoryNameOptions.join('|')})$`)
        )
      )
    }
  }

  return matchers
}
