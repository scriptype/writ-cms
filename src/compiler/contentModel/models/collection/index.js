const _ = require('lodash')
const frontMatter = require('front-matter')
const makeSlug = require('slug')
const { join, resolve } = require('path')
const {
  isTemplateFile,
  removeExtension,
  makePermalink,
  makeDateSlug,
  sort,
  Markdown,
  safeStringify
} = require('../../helpers')
const models = {
  attachment: require('../attachment'),
  category: require('./category'),
  post: require('./post'),
  facet: require('./facet')
}

function parseContent(node, content) {
  if (node.extension.match(/(html|htm|hbs|handlebars)/i)) {
    return content
  }
  return Markdown.parse(content)
}

function locatePinnedEntries(entries) {
  const pinnedEntries = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (entry.order !== undefined) {
      entries.splice(i, 1)
      pinnedEntries.push(entry)
      i--
    }
  }

  pinnedEntries.sort((a, b) => a.order - b.order)

  for (const pinnedEntry of pinnedEntries) {
    const insertIndex = pinnedEntry.order === -1 ?
      entries.length :
      pinnedEntry.order
    entries.splice(insertIndex, 0, pinnedEntry)
  }
}

function serialize(collection) {
  return {
    ...collection,
    facets: collection.facets.map(models.facet().serialize)
  }
}

const defaultSettings = {
  defaultCategoryName: '',
  collectionAliases: [],
  mode: 'start'
}
module.exports = function Collection(settings = defaultSettings, contentTypes = []) {
  const indexFileNameOptions = [
    ...settings.collectionAliases,
    'collection'
  ].filter(Boolean)

  const isCollectionIndexFile = (node) => {
    return isTemplateFile(node) && node.name.match(
      new RegExp(`^(${indexFileNameOptions.join('|')})\\..+$`)
    )
  }

  const isDataFile = (node, parentNode) => {
    return node.name.match(new RegExp(`^${parentNode.name}\\.json$`, 'i'))
  }

  const draftCheck = (node) => {
    return settings.mode === 'start' || !node.draft
  }

  return {
    serialize,

    match: node => {
      const hasCollectionIndex = node.children?.find(isCollectionIndexFile)
      const hasCollectionData = node.children?.find(childNode => isDataFile(childNode, node))
      return hasCollectionIndex || hasCollectionData
    },

    create: (node, context) => {
      function addUncategorizedPost(childNode, postData) {
        let defaultCategory = tree.categories.find(cat => cat.isDefaultCategory)
        if (!defaultCategory) {
          defaultCategory = childModels.category.create(
            { isDefaultCategory: true },
            context.push(collectionContext)
          )
          tree.categories.push(defaultCategory)
        }
        const defaultCategoryContext = _.omit(
          defaultCategory,
          ['posts', 'context', 'content', 'attachments']
        )
        const postContext = context.push({
          ...collectionContext,
          key: 'collection'
        }).push({
          ...defaultCategoryContext,
          key: 'category'
        })
        const uncategorizedPost = childNode ?
          childModels.post.create(childNode, postContext) :
          childModels.post.createFromData(postData, postContext)
        if (childModels.category.draftCheck(uncategorizedPost)) {
          defaultCategory.levelPosts.push(uncategorizedPost)
          defaultCategory.posts.push(uncategorizedPost)
          tree.levelPosts.push(uncategorizedPost)
          tree.posts.push(uncategorizedPost)
        }
      }

      const tree = {
        categories: [],
        posts: [],
        levelPosts: [],
        attachments: [],
        facets: []
      }

      const indexFile = node.children.find(isCollectionIndexFile)
      const indexProps = indexFile ? frontMatter(indexFile.content) : {}

      const contentType = contentTypes
        .filter(ct => ct.model === 'collection')
        .find(ct => ct.collectionAlias === (indexFile ? removeExtension(indexFile.name) : node.name))

      const slug = indexProps.attributes?.slug === null ?
        '' :
        indexProps.attributes?.slug || makeSlug(node.name)
      const permalink = makePermalink(context.peek().permalink, slug)
      const outputPath = join(context.peek().outputPath, slug)
      const collectionContext = {
        ...indexProps.attributes,
        contentType: indexProps.attributes?.contentType || contentType?.name || 'default',
        categoryContentType: indexProps.attributes?.categoryContentType || contentType?.categoryContentType || 'default',
        entryContentType: indexProps.attributes?.entryContentType || contentType?.entryContentType || 'default',
        categoryAlias: indexProps.attributes?.categoryAlias || contentType?.categoryAlias,
        categoriesAlias: indexProps.attributes?.categoriesAlias || contentType?.categoriesAlias,
        entryAlias: indexProps.attributes?.entryAlias || contentType?.entryAlias,
        entriesAlias: indexProps.attributes?.entriesAlias || contentType?.entriesAlias,
        defaultCategoryName: indexProps.attributes?.defaultCategoryName || contentType?.defaultCategoryName || settings.defaultCategoryName,
        sortBy: indexProps.attributes?.sortBy || contentType?.sortBy || 'date',
        sortOrder: indexProps.attributes?.sortOrder || contentType?.sortOrder || 1,
        title: indexProps.attributes?.title || node.name,
        facetKeys: indexProps.attributes?.facets || contentType?.facets || [],
        slug,
        permalink,
        outputPath
      }

      const categoriesAlias = indexProps.attributes?.categoriesAlias || contentType?.categoriesAlias
      if (categoriesAlias) {
        tree[categoriesAlias] = tree.categories
      }

      const entriesAlias = indexProps.attributes?.entriesAlias || contentType?.entriesAlias
      if (entriesAlias) {
        tree[entriesAlias] = tree.posts
      }

      const childModels = {
        attachment: models.attachment(),
        category: models.category({
          categoryAlias: indexProps.attributes?.categoryAlias || contentType?.categoryAlias,
          entryAlias: indexProps.attributes?.entryAlias || contentType?.entryAlias,
          mode: settings.mode
        }, contentTypes),
        post: models.post({
          entryAlias: indexProps.attributes?.entryAlias || contentType?.entryAlias,
          mode: settings.mode
        }, contentTypes)
      }

      node.children.forEach(childNode => {
        if (isCollectionIndexFile(childNode)) {
          return
        }
        if (isDataFile(childNode, node)) {
          const data = JSON.parse(childNode.content)
          if (!Array.isArray(data)) {
            return console.log('Collection data should be an array of posts', childNode.name)
          }
          return data.forEach(entry => {
            addUncategorizedPost(null, entry)
          })
        }
        if (childModels.post.match(childNode)) {
          return addUncategorizedPost(childNode)
        }
        if (childModels.category.match(childNode)) {
          const newCategory = childModels.category.create(
            childNode,
            context.push({
              ...collectionContext,
              key: 'collection'
            })
          )
          if (draftCheck(newCategory)) {
            tree.categories.push(newCategory)
            tree.posts.push(...newCategory.posts)
          }
          return
        }
        if (childModels.attachment.match(childNode)) {
          tree.attachments.push(
            childModels.attachment.create(
              childNode,
              context.push({
                ...collectionContext,
                key: 'collection'
              })
            )
          )
        }
      })

      const contentRaw = indexProps.body || ''
      const content = indexFile ?
        parseContent(indexFile, contentRaw) :
        ''

      return {
        ...collectionContext,
        ...tree,
        context,
        contentRaw,
        content
      }
    },

    afterEffects: (contentModel, collection) => {
      sort(collection.posts, collection.sortBy, collection.sortOrder)
      locatePinnedEntries(collection.posts)

      if (collection.facetKeys.length) {
        const collectionContext = _.omit(collection, [
          'context',
          'contentRaw',
          'content',
          'categories',
          'posts',
          'attachments',
          'facets'
        ])

        collection.facets = models.facet().collectFacets(
          collection.posts,
          collection.facetKeys,
          collection.context.push({
            ...collectionContext,
            key: 'collection'
          })
        )
      }

      collection.categories.forEach(category => {
        models.category().afterEffects(contentModel, category, collection.facets)
      })

      collection.posts.forEach(post => {
        models.post().afterEffects(contentModel, post, collection.facets)
      })

      collection.attachments.forEach(attachment => {
        models.attachment().afterEffects(contentModel, attachment)
      })

      collection.facets.forEach(facet => {
        models.facet().afterEffects(contentModel, facet)
      })
    },

    render: (renderer, collection, { contentModel, settings, debug }) => {
      const renderCollection = () => {
        const renderHTML = renderer.paginate({
          page: collection,
          posts: collection.posts,
          postsPerPage: 15, //collection.context.peek().postsPerPage,
          outputDir: collection.outputPath,
          render: async ({ outputPath, pageOfPosts, paginationData }) => {
            return renderer.render({
              templates: [
                `pages/${collection.template}`,
                `pages/collection/${collection.contentType}`,
                `pages/collection/default`
              ],
              outputPath,
              content: collection.content,
              data: {
                ...contentModel,
                collection: serialize(collection),
                pagination: paginationData,
                posts: pageOfPosts,
                settings,
                debug
              }
            })
          }
        })

        // TODO: Inspires a serialize method inside models/post
        const renderJSON = renderer.createFile({
          path: resolve(collection.outputPath, '..', `${collection.slug}.json`),
          content: safeStringify({
            data: collection.posts,
            omit: [
              'absolutePath',
              'outputPath',
              'path',
              'depth',
              'extension',
              'stats',
              'hasIndex',
              'contentRaw',
              'contentType',
              'context'
            ]
          })
        })

        return Promise.all([
          renderHTML,
          renderJSON
        ])
      }

      const renderAttachments = () => {
        return Promise.all(
          collection.attachments.map(attachment => {
            return models.attachment().render(renderer, attachment)
          })
        )
      }

      const renderCategories = () => {
        return Promise.all(
          collection.categories.map(category => {
            return models.category().render(
              renderer, category, { contentModel, settings, debug, facets: collection.facets }
            )
          })
        )
      }

      const renderFacets = () => {
        if (collection.facets.length) {
          /*
          console.log(collection.title, 'facets')
          console.dir(collection.facets, { depth: 3, color: true })
          */
        }
        return models.facet().render(
          renderer, collection.facets, { contentModel, settings, debug }
        )
      }

      return Promise.all([
        renderCollection(),
        renderAttachments(),
        renderCategories(),
        renderFacets()
      ])
    }
  }
}
