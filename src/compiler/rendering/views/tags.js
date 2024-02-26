const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderTagsPage = (Renderer, { homepage, posts, categories, subpages, tags }) => {
  if (!tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  return Renderer.render({
    template: 'pages/tags',
    outputPath: join(settings.out, 'tags', 'index.html'),
    data: {
      posts,
      categories,
      subpages,
      tags,
      settings,
      debug: Debug.getDebug()
    }
  })
}

const renderTagIndices = (Renderer, { tags, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = tags.map(tag => {
    return Renderer.render({
      template: 'pages/tags/tag',
      outputPath: join(settings.out, 'tags', tag.slug, 'index.html'),
      data: {
        tag,
        categories,
        posts,
        subpages,
        settings,
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = async (...args) => {
  await renderTagsPage(...args)
  return renderTagIndices(...args)
}
