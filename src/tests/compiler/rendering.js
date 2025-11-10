const { join } = require('path')
const { join: joinPosix } = require('path').posix
const test = require('tape')
const { getPageUrl, getAdjacentPageUrl, paginate } = require('../../compiler/renderer/pagination')

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

test('compiler/rendering', t => {
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
      page: { permalink: '/lorem' },
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

    paginate({
      page: { permalink: '/lorem' },
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 0,
      outputDir: out,
      render({ outputPath, pageOfPosts, paginationData }) {
        t.equal(
          outputPath,
          join(out, 'index.html'),
          'Index page is rendered at the base outputDir when postsPerPage is 0'
        )

        t.deepEqual(
          pageOfPosts,
          ['a', 'b', 'c', 'd', 'e'],
          'Index page gets all posts when postsPerPage is 0'
        )

        t.deepEqual(
          paginationData,
          undefined,
          'paginationData is not available when postsPerPage is 0'
        )
      }
    })

    paginate({
      page: { permalink: '/lorem' },
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 'something',
      outputDir: out,
      render({ outputPath, pageOfPosts, paginationData }) {
        t.equal(
          outputPath,
          join(out, 'index.html'),
          'Index page is rendered at the base outputDir when postsPerPage is not a number'
        )

        t.deepEqual(
          pageOfPosts,
          ['a', 'b', 'c', 'd', 'e'],
          'Index page gets all posts when postsPerPage is not a number'
        )

        t.deepEqual(
          paginationData,
          undefined,
          'paginationData is not available when postsPerPage is not a number'
        )
      }
    })
  })

  t.test('pagination.paginate (postsPerPage override from frontMatter)', async () => {
    let pageNumber = 0
    const out = join('/', 'some', 'absolute', 'path', 'to', 'lorem')
    paginate({
      page: { permalink: '/lorem', 'posts per page': 3 },
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
            ['a', 'b', 'c'],
            'First page gets the first [postsPerPage] items'
          )

          t.deepEqual(
            paginationData,
            {
              previousPage: undefined,
              nextPage: '/lorem/page/2',
              numberOfPages: 2,
              pages: [
                { url: '/lorem', number: 1, current: true },
                { url: '/lorem/page/2', number: 2, current: false }
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
            ['d', 'e'],
            'Second page gets the second [postsPerPage] items'
          )

          t.deepEqual(
            paginationData,
            {
              previousPage: '/lorem',
              nextPage: undefined,
              numberOfPages: 2,
              pages: [
                { url: '/lorem', number: 1, current: false },
                { url: '/lorem/page/2', number: 2, current: true }
              ]
            },
            'Second page gets correct paginationData'
          )
        }
        if (pageNumber === 2) {
          t.fail('There should not be a third page')
        }
        pageNumber++
      }
    })

    paginate({
      page: { permalink: '/lorem', 'posts per page': 0 },
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 2,
      outputDir: out,
      render({ outputPath, pageOfPosts, paginationData }) {
        t.equal(
          outputPath,
          join(out, 'index.html'),
          'Index page is rendered at the base outputDir when postsPerPage is 0 (override)'
        )

        t.deepEqual(
          pageOfPosts,
          ['a', 'b', 'c', 'd', 'e'],
          'Index page gets all posts when postsPerPage is 0 (override)'
        )

        t.deepEqual(
          paginationData,
          undefined,
          'paginationData is not available when postsPerPage is 0 (override)'
        )
      }
    })

    paginate({
      page: { permalink: '/lorem', 'posts per page': 'anything' },
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 2,
      outputDir: out,
      render({ outputPath, pageOfPosts, paginationData }) {
        t.equal(
          outputPath,
          join(out, 'index.html'),
          'Index page is rendered at the base outputDir when postsPerPage is not a number (override)'
        )

        t.deepEqual(
          pageOfPosts,
          ['a', 'b', 'c', 'd', 'e'],
          'Index page gets all posts when postsPerPage is not a number (override)'
        )

        t.deepEqual(
          paginationData,
          undefined,
          'paginationData is not available when postsPerPage is not a number (override)'
        )
      }
    })
  })
})
