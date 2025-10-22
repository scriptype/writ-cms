const { join } = require('path')
const makeSlug = require('slug')
const { isTemplateFile, makePermalink } = require('../../helpers')
const models = {
  facet: require('./facet'),
  _baseEntry: require('../_baseEntry'),
  attachment: require('../attachment')
}

const defaultSettings = {
  entryAlias: undefined
}
module.exports = function Post(settings = defaultSettings, contentTypes = []) {
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

      const permalink = makePermalink(
        context.peek().permalink,
        baseEntryProps.slug
      ) + (node.children ? '' : '.html')

      const outputPath = join(context.peek().outputPath, baseEntryProps.slug)

      const postContext = {
        title: baseEntryProps.title,
        slug: baseEntryProps.slug,
        permalink,
        outputPath,
      }

      const contentType = context.peek().entryContentType

      return {
        ...baseEntryProps,
        ...postContext,
        context,
        contentType,
        schema: contentTypes.find(ct => ct.name === contentType),
        date: new Date(baseEntryProps.date || baseEntryProps.stats.birthtime || Date.now()),
        attachments: baseEntryProps.attachments.map(
          attachment => attachment(context.push({
            ...postContext,
            key: 'post'
          }))
        )
      }
    },

    afterEffects: (contentModel, post, facets) => {
      models.facet().linkEntryFieldsToFacets(post, facets)

      post.attachments.forEach(attachment => {
        models.attachment().afterEffects(contentModel, attachment)
      })
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
            `pages/post/${entryAlias}`,
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
