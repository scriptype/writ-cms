const { join } = require('path')
const _ = require('lodash')

const getPageUrl = (basePermalink, pageNumber) => {
  if (basePermalink === '/') {
    return basePermalink + ['page', String(pageNumber)].join('/')
  }
  return [basePermalink, 'page', String(pageNumber)].join('/')
}

const getAdjacentPageUrl = (basePermalink, pageIndex, pagination, isNextPage) => {
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
  return getPageUrl(basePermalink, pageNumber)
}

const paginate = ({ page, posts, postsPerPage: _postsPerPage, outputDir, render }) => {
  // TODO: i18n
  const paginationSettingOverride = page['posts per page']

  // Override should take effect and either work or turn off pagination completely
  const postsPerPage = (paginationSettingOverride || typeof paginationSettingOverride === 'number') ?
    paginationSettingOverride :
    _postsPerPage

  if (postsPerPage <= 0 || typeof postsPerPage !== 'number') {
    return render({
      outputPath: join(outputDir, 'index.html'),
      pageOfPosts: posts
    })
  }

  const pagination = _.chunk(posts, postsPerPage)

  if (!pagination.length) {
    return render({
      outputPath: join(outputDir, 'index.html'),
      pageOfPosts: []
    })
  }

  const basePermalink = page.permalink

  const pages = currentPageIndex => {
    return pagination.map((pageOfPosts, i) => {
      return {
        url: i === 0 ? basePermalink : getPageUrl(basePermalink, i + 1),
        number: i + 1,
        current: i === currentPageIndex
      }
    })
  }

  /* Render pagination[0] as the index itself
   * and pagination[n] as /page/n+1 */
  return pagination.map(async (pageOfPosts, i) => {
    const paginationData = {
      previousPage: getAdjacentPageUrl(basePermalink, i),
      nextPage: getAdjacentPageUrl(basePermalink, i, pagination, true),
      numberOfPages: pagination.length,
      pages: pages(i)
    }

    if (i === 0) {
      return render({
        outputPath: join(outputDir, 'index.html'),
        pageOfPosts,
        paginationData
      })
    }

    // TODO: i18n
    return render({
      outputPath: join(outputDir, 'page', String(i + 1), 'index.html'),
      pageOfPosts,
      paginationData
    })
  })
}

module.exports = {
  getPageUrl,
  getAdjacentPageUrl,
  paginate
}
