const { mkdir } = require('fs/promises')
const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { getSlug, replaceExtension } = require('../../../helpers')

const getExportPath = (subpage) => {
  const { out } = Settings.getSettings()
  const pathWithHTMLExtension = replaceExtension(getSlug(subpage.path), '.html')
  if (subpage.foldered) {
    const pathWithCorrectFileName = pathWithHTMLExtension.replace(/page\.html$/i, 'index.html')
    return join(out, pathWithCorrectFileName)
  }
  return join(out, pathWithHTMLExtension)
}

const mkdirSubpageFolder = async (subpage) => {
  const { out } = Settings.getSettings()
  try {
    return await mkdir(join(out, subpage.permalink))
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderSubpages = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = subpages.map(async (subpage) => {
    if (subpage.foldered) {
      await mkdirSubpageFolder(subpage)
    }
    return Renderer.render({
      template: `pages/subpage/${subpage.type}`,
      outputPath: getExportPath(subpage),
      content: subpage.content,
      data: {
        ...subpage,
        homepage,
        posts,
        categories,
        subpages,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages
