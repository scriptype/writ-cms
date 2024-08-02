const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')
const { paginate } = require('../../helpers/pagination')
const { filterPosts } = require('../../helpers/filterPosts')

const renderHomepage = async (Renderer, contentModel) => {
  const settings = Settings.getSettings()
  const { homepage } = contentModel
  return Renderer.render({
    template: `root/pages/homepage/${homepage.type}`,
    outputPath: join(settings.out, 'index.html'),
    content: homepage.content,
    data: {
      ...contentModel,
      settings,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomepage
