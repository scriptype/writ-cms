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

const renderBareTagPage = async (Renderer, { posts, categories, tags }) => {
  if (!tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  await mkdir(join(settings.out, 'tag'))
  return Renderer.render({
    path: join(settings.out, 'tag', 'index.html'),
    content: '{{>index}}',
    data: {
      posts,
      categories,
      tags,
      settings,
      debug: Debug.getDebug()
    }
  })
}

const renderTagIndices = async (Renderer, contentModel) => {
  await renderBareTagPage(Renderer, contentModel)

  const { tags } = contentModel
  const settings = Settings.getSettings()

  const compilation = tags.map(async tag => {
    const dir = join(settings.out, 'tag', tag.slug)
    await mkTagDir(dir)
    return Renderer.render({
      path: join(dir, 'index.html'),
      content: '{{>tag}}',
      data: {
        tag,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderTagIndices