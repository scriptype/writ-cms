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
  const outPath = join(settings.out, 'tags')
  await mkdir(outPath)
  return Renderer.render({
    path: join(outPath, 'index.html'),
    content: `{{>pages/tags}}`,
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
    const outPath = join(settings.out, 'tags', tag.slug)
    await mkTagDir(outPath)
    return Renderer.render({
      path: join(outPath, 'index.html'),
      content: '{{>pages/tags/tag}}',
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
