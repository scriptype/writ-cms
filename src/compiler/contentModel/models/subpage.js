const Settings = require('../../../settings')
const { getSlug, removeExtension } = require('../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')

const createSubpage = (fsObject) => {
  const metadata = parseTemplate(fsObject)
  const title = metadata.title || removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data: {
      type: metadata.type || 'subpage',
      title,
      content: metadata.content,
      summary: metadata.summary,
      tags: metadata.tags,
      publishDatePrototype: {
        value: metadata.publishDate || fsObject.stats.birthtime,
        checkCache: !metadata.publishDate
      },
      ...metadata.attributes,
      slug: getSlug(title),
      path: fsObject.path,
      site: Settings.getSettings().site
    }
  }
}

const createSubpages = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.SUBPAGES,
    data: fsObject.children.map(fsObject => createSubpage(fsObject))
  }
}

module.exports = {
  createSubpage,
  createSubpages
}
