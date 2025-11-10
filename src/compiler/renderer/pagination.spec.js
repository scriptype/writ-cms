const { join } = require('path')
const { join: joinPosix } = require('path').posix
const test = require('tape')
const { getPageUrl, getAdjacentPageUrl, paginate } = require('../../compiler/renderer/pagination')

const verifyAllPostsReturned = (t, options) => {
  const { basePermalink, posts, outputDir, postsPerPage, description } = options
  paginate({
    basePermalink,
    posts,
    postsPerPage,
    outputDir,
    render({ outputPath, pageOfPosts, paginationData }) {
      t.equal(
        outputPath,
        join(outputDir, 'index.html'),
        `Index page is rendered at the base outputDir when ${description}`
      )

      t.deepEqual(
        pageOfPosts,
        posts,
        `Index page gets all posts when ${description}`
      )

      t.deepEqual(
        paginationData,
        undefined,
        `paginationData is not available when ${description}`
      )
    }
  })
}

const casesForGetPageUrl = (t, basePermalink) => {
  t.equal(
    getAdjacentPageUrl(basePermalink, 0),
    undefined,
    `${basePermalink} does not have previousPage url`
  )

  t.equal(
    getAdjacentPageUrl(basePermalink, 0, ['a'], true),
    undefined,
    `${basePermalink} does not have nextPage url if there is no next page`
  )

  t.equal(
    getAdjacentPageUrl(basePermalink, 0, ['a', 'b'], true),
    joinPosix(basePermalink, '/page/2'),
    `${basePermalink} has correct nextPage url if there is next page`
  )

  t.equal(
    getAdjacentPageUrl(basePermalink, 1),
    basePermalink,
    `${joinPosix(basePermalink, '/page/2')} has correct previousPage url`
  )

  t.equal(
    getAdjacentPageUrl(basePermalink, 1, ['a', 'b'], true),
    undefined,
    `${joinPosix(basePermalink, '/page/2')} does not have nextPage url if it is the last page`
  )

  t.equal(
    getAdjacentPageUrl(basePermalink, 1, ['a', 'b', 'c'], true),
    joinPosix(basePermalink, '/page/3'),
    `${joinPosix(basePermalink, '/page/2')} has correct nextPage url if there is next page`
  )
}

test('pagination', t => {
  t.test('pagination.getAdjacentPageUrl (basePermalink: /)', async () => {
    casesForGetPageUrl(t, '/')
  })

  t.test('pagination.getAdjacentPageUrl (basePermalink: /blog)', async () => {
    casesForGetPageUrl(t, '/blog')
  })

  t.test('pagination.getAdjacentPageUrl (basePermalink: /blog/writings)', async () => {
    casesForGetPageUrl(t, '/blog/writings')
  })

  t.test('pagination.paginate (postsPerPage from settings)', async () => {
    let pageNumber = 0
    const out = join('/', 'some', 'absolute', 'path', 'to', 'lorem')
    paginate({
      basePermalink: '/lorem',
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 2,
      outputDir: out,
      render({ outputPath, pageOfPosts, paginationData }) {
        if (pageNumber === 0) {
          t.equal(
            outputPath,
            join(out, 'index.html'),
            'First page is rendered at the base outputDir'
          )

          t.deepEqual(
            pageOfPosts,
            ['a', 'b'],
            'First page gets the first [postsPerPage] items'
          )

          t.deepEqual(
            paginationData,
            {
              previousPage: undefined,
              nextPage: '/lorem/page/2',
              numberOfPages: 3,
              pages: [
                { url: '/lorem', number: 1, current: true },
                { url: '/lorem/page/2', number: 2, current: false },
                { url: '/lorem/page/3', number: 3, current: false }
              ]
            },
            'First page gets correct paginationData'
          )
        }
        if (pageNumber === 1) {
          t.equal(
            outputPath,
            join(out, 'page', '2', 'index.html'),
            'Second page is rendered at the correct path'
          )

          t.deepEqual(
            pageOfPosts,
            ['c', 'd'],
            'Second page gets the second [postsPerPage] items'
          )

          t.deepEqual(
            paginationData,
            {
              previousPage: '/lorem',
              nextPage: '/lorem/page/3',
              numberOfPages: 3,
              pages: [
                { url: '/lorem', number: 1, current: false },
                { url: '/lorem/page/2', number: 2, current: true },
                { url: '/lorem/page/3', number: 3, current: false }
              ]
            },
            'Second page gets correct paginationData'
          )
        }
        if (pageNumber === 2) {
          t.equal(
            outputPath,
            join(out, 'page', '3', 'index.html'),
            'Third page is rendered at the correct path'
          )

          t.deepEqual(
            pageOfPosts,
            ['e'],
            'Third page gets the second [postsPerPage] items'
          )

          t.deepEqual(
            paginationData,
            {
              previousPage: '/lorem/page/2',
              nextPage: undefined,
              numberOfPages: 3,
              pages: [
                { url: '/lorem', number: 1, current: false },
                { url: '/lorem/page/2', number: 2, current: false },
                { url: '/lorem/page/3', number: 3, current: true }
              ]
            },
            'Third page gets correct paginationData'
          )
        }
        if (pageNumber === 3) {
          t.fail('There should not be a fourth page')
        }
        pageNumber++
      }
    })

    verifyAllPostsReturned(t, {
      basePermalink: '/lorem',
      posts: ['a', 'b', 'c', 'd', 'e'],
      outputDir: out,
      postsPerPage: 0,
      description: 'postsPerPage is 0'
    })

    verifyAllPostsReturned(t, {
      basePermalink: '/lorem',
      posts: ['a', 'b', 'c', 'd', 'e'],
      outputDir: out,
      postsPerPage: 'something',
      description: 'postsPerPage is not a number'
    })

    verifyAllPostsReturned(t, {
      basePermalink: '/lorem',
      posts: ['a', 'b', 'c', 'd', 'e'],
      outputDir: out,
      postsPerPage: -5,
      description: 'postsPerPage is negative'
    })

    verifyAllPostsReturned(t, {
      basePermalink: '/lorem',
      posts: ['a', 'b', 'c', 'd', 'e'],
      outputDir: out,
      postsPerPage: undefined,
      description: 'postsPerPage is omitted'
    })
  })

  t.test('pagination.paginate (explicit postsPerPage)', async () => {
    let pageNumber = 0
    const out = join('/', 'some', 'absolute', 'path', 'to', 'lorem')

    paginate({
      basePermalink: '/lorem',
      posts: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      postsPerPage: 15,
      outputDir: out,
      render({ outputPath, pageOfPosts, paginationData }) {
        if (pageNumber === 0) {
          t.equal(
            outputPath,
            join(out, 'index.html'),
            'First page is rendered at the base outputDir'
          )

          t.equal(
            pageOfPosts.length,
            15,
            'First page gets 15 posts (explicit postsPerPage)'
          )

          t.deepEqual(
            paginationData.numberOfPages,
            2,
            'Has correct number of pages with postsPerPage of 15'
          )
        }
        if (pageNumber === 1) {
          t.equal(
            outputPath,
            join(out, 'page', '2', 'index.html'),
            'Second page is rendered at the correct path'
          )

          t.equal(
            pageOfPosts.length,
            15,
            'Second page gets remaining 15 posts'
          )
        }
        if (pageNumber === 2) {
          t.fail('There should not be a third page')
        }
        pageNumber++
      }
    })
  })
})
