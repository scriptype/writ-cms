const { mkdir } = require('fs/promises')
const { join } = require('path')
const { join: posixJoin } = require('path').posix
const _ = require('lodash')
const Settings = require('../../../settings')

const getPageUrl = (basePermalink, pageIndex, pagination, isNextPage) => {
  if (isNextPage && pageIndex === pagination.length - 1) {
    return undefined
  }
  if (!isNextPage && pageIndex === 0) {
    return undefined
  }
  if (!isNextPage && pageIndex === 1) {
    return basePermalink
  }
  const pageNumber = isNextPage ? pageIndex + 2 : pageIndex
  if (basePermalink === '/') {
    return basePermalink + ['page', String(pageNumber)].join('/')
  }
  return [basePermalink, 'page', String(pageNumber)].join('/')
}

const paginate = ({ page, posts, outPath, render }) => {
  const settings = Settings.getSettings()

  // TODO: i18n
  const paginationSettingOverride = page['posts per page']

  const postsPerPage = typeof paginationSettingOverride === 'number' ?
    paginationSettingOverride :
    settings.postsPerPage

  if (postsPerPage <= 0 || typeof postsPerPage !== 'number') {
    return render(join(outPath, 'index.html'), posts)
  }

  const pagination = _.chunk(posts, postsPerPage)

  if (!pagination.length) {
    return render(join(outPath, 'index.html'), [])
  }

  const basePermalink = page.permalink

  /* Render pagination[0] as the index itself
   * and pagination[n] as /page/n+1 */
  return pagination.map(async (pageOfPosts, i) => {
    const paginationData = {
      previousPage: getPageUrl(basePermalink, i),
      nextPage: getPageUrl(basePermalink, i, pagination, true),
      numberOfPages: pagination.length
    }

    if (i === 0) {
      return render(join(outPath, 'index.html'), pageOfPosts, paginationData)
    }

    // TODO: i18n
    const pageOutPath = join(outPath, 'page', String(i + 1))
    await mkdir(pageOutPath, { recursive: true })
    return render(join(pageOutPath, 'index.html'), pageOfPosts, paginationData)
  })
}

module.exports = {
  getPageUrl,
  paginate
}
