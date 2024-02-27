const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderSubpages = (Renderer, contentModel) => {
  const settings = Settings.getSettings()
  const compilation = contentModel.subpages.map(subpage => {
    const outputPath = join(
      settings.out,
      subpage.permalink,
      subpage.foldered ? 'index.html' : ''
    )
    return Renderer.render({
      template: `pages/subpage/${subpage.type}`,
      outputPath,
      content: subpage.content,
      data: {
        ...contentModel,
        subpage,
        settings,
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = renderSubpages
