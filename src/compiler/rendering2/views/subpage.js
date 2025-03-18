const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderSubpages = (Renderer, contentModel) => {
  const compilation = contentModel.subpages.map(subpage => {
    return Renderer.render({
      templates: [
        `pages/${subpage.template}`,
        `pages/${subpage.contentType}`,
        `pages/subpage`
      ],
      outputPath: subpage.outputPath,
      content: subpage.content,
      data: {
        ...contentModel,
        subpage,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = renderSubpages
