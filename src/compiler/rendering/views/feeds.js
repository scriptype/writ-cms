const { join } = require('path')
const { writeFile, mkdir } = require('fs/promises')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { urls, inlineMedia } = require('../helpers/processContent')

const POST_COUNT = 25

const processPartialBlock = (compiledBlockContent, entry) => {
  const { site } = Settings.getSettings()
  return Promise.resolve(compiledBlockContent)
    .then(content => inlineMedia(content, entry))
    .then(content => {
      const baseUrl = new URL(entry.permalink, site.url).toString()
      return urls(content, baseUrl)
    })
}

const processPosts = (Renderer, contentModel) => {
  return Promise.all(contentModel.posts.map(async post => {
    const compiledContent = await Renderer.compile({
      data: contentModel,
      content: post.content
    })

    const compiledSummary = await Renderer.compile({
      data: contentModel,
      content: post.summary
    })

    return {
      ...post,
      content: processPartialBlock(compiledContent, post),
      summary: processPartialBlock(compiledSummary, post)
    }
  }))
}

const renderRSSFeed = async (Renderer, contentModel) => {
  const { out, site, rss } = Settings.getSettings()
  if (rss === 'off') {
    return Promise.resolve()
  }
  if (!site.url) {
    Debug.debugLog('Setting "url" is needed for RSS feeds. Aborting.')
    return Promise.resolve()
  }

  Debug.debugLog('creating feeds')

  const processedPosts = await processPosts(Renderer, contentModel)

  const compilation = [
    Renderer.render({
      template: 'features/rss',
      outputPath: join(out, 'feed.xml'),
      data: {
        feed: {
          title: site.title,
          link: site.url,
          description: site.description,
          permalink: new URL('feed.xml', `${site.url}/`).toString(),
          iconUrl: new URL(site.icon, `${site.url}/`).toString(),
          lastBuildDate: new Date().toUTCString(),
        },
        posts: processedPosts.slice(0, POST_COUNT),
        categories: contentModel.categories,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    }),
    ...contentModel.categories.map(category => {
      Debug.debugLog('creating category feed:', category.name)
      return Renderer.render({
        template: 'features/rss',
        outputPath: join(out, category.slug, 'feed.xml'),
        data: {
          feed: {
            title: site.title + ' | ' + category.name,
            link: new URL(category.slug, `${site.url}/`).toString(),
            description: `${category.name} category on ${site.title}`,
            permalink: new URL(`${category.slug}/feed.xml`, `${site.url}/`).toString(),
            iconUrl: new URL(site.icon, `${site.url}/`).toString(),
            lastBuildDate: new Date(),
          },
          posts: category.posts.slice(0, POST_COUNT).map(({ handle }) => {
            return processedPosts.find(p => p.handle === handle)
          }),
          categories: contentModel.categories,
          settings: Settings.getSettings(),
          debug: Debug.getDebug()
        }
      })
    })
  ]

  return Promise.all(compilation)
}

module.exports = renderRSSFeed
