const { join } = require('path')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const { isTemplateFile, Markdown } = require('../../helpers')
const models = {
  post: require('./post'),
  attachment: require('../attachment')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

const defaultSettings = {
  categoryAlias: undefined,
  entryAlias: undefined
}
module.exports = function category(settings = defaultSettings) {
  const indexFileNameOptions = [settings.categoryAlias, 'category'].filter(Boolean)

  const isCategoryIndexFile = (node) => {
    return isTemplateFile(node) && node.name.match(
      new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
    )
  }

  const childModels = {
    attachment: models.attachment(),
    post: models.post({
      entryAlias: settings.entryAlias
    })
  }

  return {
    match: (node) => node.children?.find(childModels.post.match),
    create(node, context) {
      function linkPosts(post, postIndex, posts) {
        post.links = {}
        if (postIndex > 0) {
          post.links.nextPost = {
            title: posts[postIndex - 1].title,
            permalink: posts[postIndex - 1].permalink
          }
        }
        if (postIndex < posts.length - 1) {
          post.links.previousPost = {
            title: posts[postIndex + 1].title,
            permalink: posts[postIndex + 1].permalink
          }
        }
      }

      const entriesAlias = context.collection.entriesAlias

      if (node.isDefaultCategory) {
        const title = context.collection.defaultCategoryName
        const slug = makeSlug(title)

        const defaultCategory = {
          context,
          contentType: context.collection.categoryContentType,
          content: '',
          contentRaw: '',
          slug,
          title,
          permalink: [context.collection.permalink, slug].join('/'),
          outputPath: join(context.collection.outputPath, slug),
          isDefaultCategory: true,
          posts: [],
          attachments: []
        }

        if (entriesAlias) {
          defaultCategory[entriesAlias] = defaultCategory.posts
        }

        return defaultCategory
      }

      const indexFile = node.children.find(isCategoryIndexFile)
      const indexProps = indexFile ? frontMatter(indexFile.content) : {}

      const slug = indexProps.attributes?.slug || makeSlug(node.name)
      const permalink = [context.collection.permalink, slug].join('/')
      const outputPath = join(context.collection.outputPath, slug)

      const categoryContext = {
        ...indexProps.attributes,
        contentType: context.collection.categoryContentType,
        title: indexProps.attributes?.title || node.name,
        slug,
        permalink,
        outputPath,
      }

      const tree = {
        posts: [],
        attachments: []
      }

      if (entriesAlias) {
        tree[entriesAlias] = tree.posts
      }

      node.children.forEach(childNode => {
        if (isCategoryIndexFile(childNode)) {
          return
        }
        if (childModels.post.match(childNode)) {
          return tree.posts.push(
            childModels.post.create(childNode, {
              ...context,
              category: categoryContext
            })
          )
        }
        return tree.attachments.push(
          childModels.attachment.create(childNode, {
            ...context,
            category: categoryContext
          })
        )
      })

      tree.posts.sort((a, b) => b.date - a.date)
      tree.posts.forEach(linkPosts)

      const contentRaw = indexProps.body || ''
      const content = indexFile ?
        parseContent(indexFile, contentRaw) :
        ''

      return {
        ...categoryContext,
        ...tree,
        context,
        contentRaw,
        content
      }
    }
  }
}
