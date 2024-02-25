const { mkdir } = require('fs/promises')
const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const mkTagDir = async (dirName) => {
  try {
    return await mkdir(dirName)
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderTagIndex = async (Renderer, { homepage, posts, categories, subpages, tags }) => {
  if (!tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  const outputDir = join(settings.out, 'tags')
  await mkdir(outputDir)
  return Renderer.render({
    template: 'pages/tags',
    outputPath: join(outputDir, 'index.html'),
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

const renderTagIndices = async (Renderer, contentModel) => {
  await renderTagIndex(Renderer, contentModel)

  const { tags } = contentModel
  const settings = Settings.getSettings()

  const compilation = tags.map(async tag => {
    const outputDir = join(settings.out, 'tags', tag.slug)
    await mkTagDir(outputDir)
    return Renderer.render({
      template: 'pages/tags/tag',
      outputPath: join(outputDir, 'index.html'),
      data: {
        tag,
        categories: contentModel.categories,
        posts: contentModel.posts,
        subpages: contentModel.subpages,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderTagIndices
