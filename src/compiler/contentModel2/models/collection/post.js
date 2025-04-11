const { join } = require('path')
const { isTemplateFile, parseArray } = require('../../helpers')
const models = {
  _baseEntry: require('../_baseEntry'),
  attachment: require('../attachment'),
  tag: require('./tag')
}

const defaultSettings = {
  entryAlias: undefined
}
module.exports = function Post(settings = defaultSettings) {
  const indexFileNameOptions = [settings.entryAlias, 'post', 'index'].filter(Boolean)

  const isPostIndexFile = (node) => {
    return (
      isTemplateFile(node) &&
      node.name.match(
        new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
      )
    )
  }

  return {
    match: (node) => (
      isTemplateFile(node) || node.children?.find(isPostIndexFile)
    ),

    create: (node, context) => {
      const baseEntryProps = models._baseEntry(node, indexFileNameOptions)

      const permalink = [
        context.peek().permalink,
        baseEntryProps.slug
      ].join('/') + (node.children ? '' : '.html')

      const outputPath = join(context.peek().outputPath, baseEntryProps.slug)

      const postContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink,
        outputPath,
      }

      return {
        ...baseEntryProps,
        ...postContext,
        context,
        contentType: context.peek().entryContentType,
        tags: parseArray(baseEntryProps.tags).map(tagName => {
          const topContext = context.throwUntil(layer => layer.key === 'collection')
          return models.tag().create(tagName, topContext)
        }),
        date: new Date(baseEntryProps.date || baseEntryProps.stats.birthtime || Date.now()),
        attachments: baseEntryProps.attachments.map(
          attachment => attachment(context.push({
            ...postContext,
            key: 'post'
          }))
        )
      }
    },

    render: (renderer, post, { contentModel, settings, debug }) => {
      const renderPost = () => {
        const data = {
          ...contentModel,
          post,
          settings,
          debug
        }
        const entryAlias = post.context.peek().entryAlias
        if (entryAlias) {
          data[entryAlias] = data.post
        }

        return renderer.render({
          templates: [
            `pages/${post.template}`,
            `pages/post/${post.contentType}`,
            `pages/post/default`
          ],
          outputPath: join(...[
            post.outputPath,
            post.hasIndex ? 'index' : ''
          ].filter(Boolean)) + '.html',
          content: post.content,
          data
        })
      }

      const renderAttachments = () => {
        return Promise.all(
          post.attachments.map(attachment => {
            return models.attachment().render(renderer, attachment)
          })
        )
      }

      return Promise.all([
        renderPost(),
        renderAttachments()
      ])
    }
  }
}
