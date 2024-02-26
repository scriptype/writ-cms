const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderSubpages = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = subpages.map(subpage => {
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
