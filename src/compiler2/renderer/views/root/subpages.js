const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

const renderSubpages = (Renderer, contentModel) => {
  const { out } = Settings.getSettings()
  const compilation = contentModel.subpages.map(subpage => {
    return Renderer.render({
      template: `root/pages/subpage/${subpage.type}`,
      outputPath: join(out, subpage.outputPath),
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
