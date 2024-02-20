const Settings = require('../../../settings')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')

const createHomepage = (fsObject) => {
  const permalink = Settings.getSettings().permalinkPrefix

  const metadata = fsObject ?
    parseTemplate(fsObject, { permalink }) :
    { attributes: {} }

  return {
    ...(fsObject || {}),
    type: contentTypes.HOMEPAGE,
    data: {
      type: metadata.type || '',
      name: metadata.title || '',
      content: metadata.content || '',
      mentions: metadata.mentions || [],
      ...metadata.attributes,
      permalink
    }
  }
}

module.exports = {
  createHomepage
}
