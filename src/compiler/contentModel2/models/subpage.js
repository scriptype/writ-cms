const { join, resolve } = require('path')
const { isTemplateFile, makePermalink } = require('../helpers')
const models = {
  _baseEntry: require('./_baseEntry'),
  attachment: require('./attachment'),
}

const defaultSettings = {
  pagesDirectory: 'pages'
}
module.exports = function Subpage(settings = defaultSettings) {
  const indexFileNameOptions = ['page', 'index']
  const pagesDirectoryNameOptions = [settings.pagesDirectory, 'subpages', 'pages']

  const isSubpageIndexFile = (node) => {
    return (
      isTemplateFile(node) &&
      node.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
      )
    )
  }

  const isFolderedSubpage = (node) => {
    return node.children?.find(isSubpageIndexFile)
  }

  const isPagesDirectory = (node) => {
    return (
      node.children &&
      node.name.match(
        new RegExp(`^(${pagesDirectoryNameOptions.join('|')})$`)
      )
    )
  }

  return {
    match: node => isTemplateFile(node) || isFolderedSubpage(node),
    matchPagesDirectory: node => isPagesDirectory(node),

    create: (node, context) => {
      const baseEntryProps = models._baseEntry(node, indexFileNameOptions)

      const permalink = makePermalink(
        context.peek().permalink,
        baseEntryProps.slug
      ) + (baseEntryProps.hasIndex ? '' : '.html')

      const outputPath = join(
        context.peek().outputPath,
        baseEntryProps.slug
      )

      const pageContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink,
        outputPath
      }

      return {
        ...baseEntryProps,
        ...pageContext,
        context,
        attachments: baseEntryProps.attachments.map(
          attachment => attachment(context.push({
            ...pageContext,
            key: 'page'
          }))
        )
      }
    },

    afterEffects: (contentModel, subpage) => {
      subpage.attachments.forEach(attachment => {
        models.attachment().afterEffects(contentModel, attachment)
      })
    },

    render: (renderer, subpage, { contentModel, settings, debug }) => {
      const renderSubpage = () => {
        return renderer.render({
          templates: [
            `pages/${subpage.template}`,
            `pages/subpage/${subpage.contentType}`,
            `pages/subpage/default`
          ],
          outputPath: join(...[
            subpage.outputPath,
            subpage.hasIndex ? 'index' : ''
          ]) + '.html',
          content: subpage.content,
          data: {
            ...contentModel,
            subpage,
            settings,
            debug
          }
        })
      }

      const renderAttachments = () => {
        return Promise.all(
          subpage.attachments.map(attachment => {
            return models.attachment().render(renderer, attachment)
          })
        )
      }

      return Promise.all([
        renderSubpage(),
        renderAttachments()
      ])
    }
  }
}
