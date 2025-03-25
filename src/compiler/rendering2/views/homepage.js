const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderHomepage = async (Renderer, contentModel) => {
  const { homepage } = contentModel

  const renderPage = Renderer.render({
    templates: [
      `pages/${homepage.template}`,
      `pages/${homepage.contentType}`,
      `pages/homepage`
    ],
    outputPath: homepage.outputPath,
    content: homepage.content,
    data: {
      ...contentModel,
      homepage,
      settings: Settings.getSettings(),
      debug: Debug.getDebug()
    }
  })

  const copyAttachments = homepage.attachments.map(node => {
    return Renderer.copy({
      src: node.absolutePath,
      dest: node.outputPath,
      recursive: !!node.children
    })
  })

  return Promise.all([
    renderPage,
    ...copyAttachments
  ])
}

module.exports = renderHomepage
