const Settings = require('../../../settings')
const { getSlug, removeExtension } = require('../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')

const createSubpage = async (fsObject, cache) => {
  const { site } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data: {
      title,
      ...(await parseTemplate(fsObject, cache, { subpage: true })),
      slug: getSlug(title),
      site,
    }
  }
}

const createSubpages = async (fsObject, cache) => {
  return {
    ...fsObject,
    type: contentTypes.SUBPAGES,
    data: await Promise.all(
      fsObject.children.map(fsObject => createSubpage(fsObject, cache))
    )
  }
}

module.exports = {
  createSubpage,
  createSubpages
}
