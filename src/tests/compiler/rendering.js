const { join } = require('path').posix
const test = require('tape')
const { getPageUrl, paginate } = require('../../compiler/rendering/helpers/pagination')
const { filterPosts } = require('../../compiler/rendering/helpers/filterPosts')

const casesForGetPageUrl = (t, basePermalink) => {
  t.equal(
    getPageUrl(basePermalink, 0),
    undefined,
    `${basePermalink} does not have previousPage url`
  )

  t.equal(
    getPageUrl(basePermalink, 0, ['a'], true),
    undefined,
    `${basePermalink} does not have nextPage url if there is no next page`
  )

  t.equal(
    getPageUrl(basePermalink, 0, ['a', 'b'], true),
    join(basePermalink, '/page/2'),
    `${basePermalink} has correct nextPage url if there is next page`
  )

  t.equal(
    getPageUrl(basePermalink, 1),
    basePermalink,
    `${join(basePermalink, '/page/2')} has correct previousPage url`
  )

  t.equal(
    getPageUrl(basePermalink, 1, ['a', 'b'], true),
    undefined,
    `${join(basePermalink, '/page/2')} does not have nextPage url if it is the last page`
  )

  t.equal(
    getPageUrl(basePermalink, 1, ['a', 'b', 'c'], true),
    join(basePermalink, '/page/3'),
    `${join(basePermalink, '/page/2')} has correct nextPage url if there is next page`
  )
}

test('compiler/rendering', t => {
  t.test('pagination.getPageUrl (basePermalink: /)', async () => {
    casesForGetPageUrl(t, '/')
  })

  t.test('pagination.getPageUrl (basePermalink: /blog)', async () => {
    casesForGetPageUrl(t, '/blog')
  })

  t.test('pagination.getPageUrl (basePermalink: /blog/writings)', async () => {
    casesForGetPageUrl(t, '/blog/writings')
  })

  t.test('pagination.paginate (postsPerPage from settings)', async () => {
    let pageNumber = 0
    paginate({
      page: { permalink: '/lorem' },
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 2,
      outPath: '/some/absolute/path/to/lorem',
      render({ outputDir, outputPath, pageOfPosts, paginationData }) {
        if (pageNumber === 0) {
          t.equal(
            outputDir,
            undefined,
            'No page folder is created for index page'
          )

          t.equal(
            outputPath,
            '/some/absolute/path/to/lorem/index.html',
            'First page is rendered at the base outPath'
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
              numberOfPages: 3
            },
            'First page gets correct paginationData'
          )
        }
        if (pageNumber === 1) {
          t.equal(
            outputDir,
            '/some/absolute/path/to/lorem/page/2',
            'Correct page folder is created for second page'
          )

          t.equal(
            outputPath,
            '/some/absolute/path/to/lorem/page/2/index.html',
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
              numberOfPages: 3
            },
            'Second page gets correct paginationData'
          )
        }
        if (pageNumber === 2) {
          t.equal(
            outputDir,
            '/some/absolute/path/to/lorem/page/3',
            'Correct page folder is created for third page'
          )

          t.equal(
            outputPath,
            '/some/absolute/path/to/lorem/page/3/index.html',
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
              numberOfPages: 3
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
  })

  t.test('pagination.paginate (postsPerPage override from frontMatter)', async () => {
    let pageNumber = 0
    paginate({
      page: { permalink: '/lorem', 'posts per page': 3 },
      posts: ['a', 'b', 'c', 'd', 'e'],
      postsPerPage: 2,
      outPath: '/some/absolute/path/to/lorem',
      render({ outputDir, outputPath, pageOfPosts, paginationData }) {
        if (pageNumber === 0) {
          t.equal(
            outputDir,
            undefined,
            'No page folder is created for index page'
          )

          t.equal(
            outputPath,
            '/some/absolute/path/to/lorem/index.html',
            'First page is rendered at the base outPath'
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
              numberOfPages: 2
            },
            'First page gets correct paginationData'
          )
        }
        if (pageNumber === 1) {
          t.equal(
            outputDir,
            '/some/absolute/path/to/lorem/page/2',
            'Correct page folder is created for second page'
          )

          t.equal(
            outputPath,
            '/some/absolute/path/to/lorem/page/2/index.html',
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
              numberOfPages: 2
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
  })

  t.test('filterPost', async () => {
    const result1 = filterPosts({
      'exclude post types': 'photo'
    }, [
      { type: 'text' },
      { type: 'photo' }
    ])

    t.true(
      result1.length === 1 && result1[0].type === 'text',
      'Exclude a post type'
    )

    const result2 = filterPosts({
      'include post types': 'text'
    }, [
      { type: 'text' },
      { type: 'photo' }
    ])

    t.true(
      result2.length === 1 && result2[0].type === 'text',
      'Include a post type'
    )

    const result3 = filterPosts({
      'exclude post types': 'photo, text'
    }, [
      { type: 'text' },
      { type: 'photo' },
      { type: 'audio' }
    ])

    t.true(
      result3.length === 1 && result3[0].type === 'audio',
      'Exclude multiple post types'
    )

    const result4 = filterPosts({
      'include post types': 'audio, photo'
    }, [
      { type: 'text' },
      { type: 'photo' },
      { type: 'audio' }
    ])

    t.true(
      result4.length === 2 && result4.map(p => p.type).join() === 'photo,audio',
      'Include multiple post types'
    )
  })
})