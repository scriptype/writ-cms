const { mkdir } = require('fs/promises')
const { join } = require('path')
const _ = require('lodash')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const getPageUrl = (baseUrl, pageIndex, pagination, isNextPage) => {
  if (isNextPage && pageIndex === pagination.length - 1) {
    return undefined
  }
  if (!isNextPage && pageIndex === 0) {
    return undefined
  }
  if (!isNextPage && pageIndex === 1) {
    return baseUrl
  }
  const pageNumber = isNextPage ? pageIndex + 2 : pageIndex
  if (baseUrl === '/') {
    return baseUrl + ['page', String(pageNumber)].join('/')
  }
  return [baseUrl, 'page', String(pageNumber)].join('/')
}

const renderHomepage = async (Renderer, { homepage, categories, posts, subpages }) => {
  const render = (outputPath, pagination, paginationData) => {
    return Renderer.render({
      template: `pages/homepage/${homepage.type}`,
      outputPath: outputPath,
      content: homepage.content,
      data: {
        ...homepage,
        pagination: paginationData,
        posts: pagination,
        categories,
        subpages,
        settings,
        debug: Debug.getDebug()
      }
    })
  }

  const settings = Settings.getSettings()
  const indexOutPath = join(settings.out, 'index.html')

  const filters = {
    // TODO: i18n
    exclude: homepage['exclude post types'],
    include: homepage['include post types']
  }

  const excludedPostTypes = filters.exclude ?
    filters.exclude.split(',').map(t => t.trim()) :
    []

  const includedPostTypes = filters.include ?
    filters.include.split(',').map(t => t.trim()) :
    []

  const filteredPosts = posts
    .filter(({ type }) => !excludedPostTypes.includes(type))
    .filter(({ type }) => (
      !includedPostTypes.length || includedPostTypes.includes(type))
    )

  // TODO: i18n
  const paginationSettingOverride = homepage['posts per page']

  const postsPerPage = typeof paginationSettingOverride === 'number' ?
    paginationSettingOverride :
    settings.postsPerPage

  if (postsPerPage <= 0 || typeof postsPerPage !== 'number') {
    return render(indexOutPath, filteredPosts)
  }

  const pagination = _.chunk(filteredPosts, postsPerPage)

  if (!pagination.length) {
    return render(indexOutPath, [])
  }

  /* Render pagination[0] as homepage
   * and pagination[n] as /page/n+1 */
  return pagination.map(async (page, i) => {
    const paginationData = {
      previousPage: getPageUrl(homepage.permalink, i),
      nextPage: getPageUrl(homepage.permalink, i, pagination, true),
      numberOfPages: pagination.length
    }

    if (i === 0) {
      return render(indexOutPath, page, paginationData)
    }

    // TODO: i18n
    const outPath = join(settings.out, 'page', String(i + 1))
    await mkdir(outPath, { recursive: true })
    return render(join(outPath, 'index.html'), page, paginationData)
  })
}

module.exports = renderHomepage
