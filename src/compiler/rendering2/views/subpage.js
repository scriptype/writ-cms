const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderSubpages = (Renderer, contentModel) => {
  const compilation = contentModel.subpages.map(subpage => {
    const renderPage = Renderer.render({
      templates: [
        `pages/${subpage.template}`,
        `pages/subpage/${subpage.contentType}`,
        `pages/subpage`
      ],
      outputPath: join(...[
        subpage.outputPath,
        subpage.hasIndex ? 'index' : ''
      ]) + '.html',
      content: subpage.content,
      data: {
        ...contentModel,
        subpage,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    })

    const copyAttachments = subpage.attachments.map(node => {
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
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages
