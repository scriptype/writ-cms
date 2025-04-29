const { join, resolve } = require('path')
const { isTemplateFile } = require('../helpers')
const models = {
  _baseEntry: require('./_baseEntry'),
  attachment: require('./attachment')
}

const defaultSettings = {
  homepageDirectory: 'homepage'
}
module.exports = function Homepage(settings = defaultSettings) {
  const indexFileNameOptions = ['homepage', 'home', 'index']
  const folderNameOptions = [settings.homepageDirectory, 'homepage', 'home']

  const isHomepageFile = (node) => {
    return (
      isTemplateFile(node) &&
      node.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
      )
    )
  }

  const isHomepageDirectory = (node) => {
    return (
      node.children?.find(isHomepageFile) &&
      node.name.match(
        new RegExp(`^(${folderNameOptions.join('|')})$`)
      )
    )
  }

  return {
    match: node => isHomepageFile(node) || isHomepageDirectory(node),

    create: (node, context) => {
      const baseEntryProps = models._baseEntry(node, indexFileNameOptions)

      const pageContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink: context.peek().permalink,
        outputPath: context.peek().outputPath
      }

      return {
        ...baseEntryProps,
        ...pageContext,
        context,
        attachments: baseEntryProps.attachments.map(a => a({
          homepage: pageContext
        }))
      }
    },

    afterEffects: (contentModel, homepage) => {
      homepage.attachments.forEach(attachment => {
        models.attachment().afterEffects(contentModel, attachment)
      })
    },

    render: (renderer, homepage, { contentModel, settings, debug }) => {
      const renderHomepage = () => {
        return renderer.render({
          templates: [
            `pages/${homepage.template}`,
            `pages/homepage/${homepage.contentType}`,
            `pages/homepage/default`
          ],
          outputPath: join(homepage.outputPath, 'index.html'),
          content: homepage.content,
          data: {
            ...contentModel,
            homepage,
            settings,
            debug
          }
        })
      }

      const renderAttachments = () => {
        return Promise.all(
          homepage.attachments.map(attachment => {
            return models.attachment().render(renderer, attachment)
          })
        )
      }

      return Promise.all([
        renderHomepage(),
        renderAttachments()
      ])
    }
  }
}
