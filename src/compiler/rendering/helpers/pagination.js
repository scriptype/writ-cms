const { join } = require('path')
const _ = require('lodash')

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

const paginate = ({ page, posts, postsPerPage: _postsPerPage, outPath, render }) => {
  // TODO: i18n
  const paginationSettingOverride = page['posts per page']

  const postsPerPage = typeof paginationSettingOverride === 'number' ?
    paginationSettingOverride :
    _postsPerPage

  if (postsPerPage <= 0 || typeof postsPerPage !== 'number') {
    return render({
      outputPath: join(outPath, 'index.html'),
      pageOfPosts: posts
    })
  }

  const pagination = _.chunk(posts, postsPerPage)

  if (!pagination.length) {
    return render({
      outputPath: join(outPath, 'index.html'),
      pageOfPosts: []
    })
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
      return render({
        outputPath: join(outPath, 'index.html'),
        pageOfPosts,
        paginationData
      })
    }

    // TODO: i18n
    const outputDir = join(outPath, 'page', String(i + 1))
    return render({
      outputDir,
      outputPath: join(outputDir, 'index.html'),
      pageOfPosts,
      paginationData
    })
  })
}

module.exports = {
  getPageUrl,
  paginate
}
