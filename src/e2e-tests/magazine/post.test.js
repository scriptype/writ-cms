/*
 * Post Page Tests
 *
 * Tests that verify individual post pages:
 *   - Post pages render with title, content, and metadata
 *   - Breadcrumbs show collection and category hierarchy
 *   - Previous/next post links appear for posts in top-level categories
 */

const { tmpdir } = require('os')
const { join } = require('path')
const { mkdir, rm, readFile, cp, stat } = require('fs/promises')
const test = require('tape')
const { load } = require('cheerio')
const writ = require('../..')
const { FIXTURE_CONTENT_MODEL } = require('./fixtures/model')
const { flattenAllPosts } = require('./helpers')

const fixturesDirectory = join(__dirname, 'fixtures', 'fs')

const resolvePostPath = async (rootDir, exportDir, permalink) => {
  let postFilePath = permalink.replace(/^\//, '')

  if (postFilePath.endsWith('.html')) {
    return join(rootDir, exportDir, postFilePath)
  }

  const filePath = join(rootDir, exportDir, postFilePath + '.html')
  const indexPath = join(rootDir, exportDir, postFilePath, 'index.html')

  try {
    await stat(filePath)
    return filePath
  } catch {
    return indexPath
  }
}

test('E2E Magazine - Post Pages', async t => {

  const testDir = join(tmpdir(), 'e2e-magazine-posts-build')
  const rootDirectory = testDir
  const exportDirectory = 'docs'

  try {
    await mkdir(testDir, { recursive: true })
    await cp(fixturesDirectory, rootDirectory, { recursive: true })

    await writ.build({
      rootDirectory,
      refreshTheme: true
    })
  } catch (err) {
    t.fail(`Build magazine test failed: ${err.message}`)
    return
  }

  const allPosts = flattenAllPosts(FIXTURE_CONTENT_MODEL)

  t.test('Verify post pages render with correct content and metadata', async t => {
    for (const post of allPosts) {
      const postPath = await resolvePostPath(rootDirectory, exportDirectory, post.permalink)

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })
        const $ = load(postHtml)

        const siteTitle = $('[data-site-title]').text()
        t.equal(
          siteTitle,
          'Web Magazine',
          `${post.permalink} has correct site title`
        )

        const postTitle = $('[data-title]').text()

        if (post.template === 'ReactBadMKay') {
          t.equal(
            postTitle,
            `${post.title} mmkaaay?`,
            `${post.permalink} has custom template content in title`
          )
        } else {
          t.equal(
            postTitle,
            post.title,
            `${post.permalink} has correct post title via data attribute`
          )
        }

        const contentElement = $('[data-content]')

        if (post.content) {
          t.ok(
            contentElement.html().includes(post.content),
            `${post.permalink} renders post content`
          )
        }

        const breadcrumbLinks = $('[data-breadcrumb-link]').toArray()
        const collectionLink = breadcrumbLinks.find(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return (
            linkText === post.context.collection.title &&
            linkHref === post.context.collection.permalink
          )
        })

        t.ok(
          collectionLink,
          `${post.permalink} has breadcrumb link to collection`
        )

        const allCategoryLinksPresent = post.context.categories.every(cat => {
          return breadcrumbLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === cat.title && linkHref === cat.permalink
          })
        })

        t.ok(
          allCategoryLinksPresent,
          `${post.permalink} has breadcrumb links to all categories`
        )
      } catch (err) {
        t.fail(
          `${post.permalink} page: ${err.message}`
        )
      }
    }
  })

  t.test('Verify Person post related content links', async t => {
    for (const post of allPosts) {
      if (post.contentType !== 'Person') {
        continue
      }

      const postPath = await resolvePostPath(rootDirectory, exportDirectory, post.permalink)

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })
        const $ = load(postHtml)

        if (post.demos) {
          const demoLinks = $('[data-demo-link]').toArray()
          const allDemosLinked = post.demos.every(demo => {
            return demoLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === demo.title && linkHref === demo.permalink
            })
          })

          t.ok(
            allDemosLinked,
            `${post.permalink} displays all demos with correct links`
          )
        }

        if (post.articles) {
          const articleLinks = $('[data-article-link]').toArray()
          const allArticlesLinked = post.articles.every(article => {
            return articleLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === article.title && linkHref === article.permalink
            })
          })

          t.ok(
            allArticlesLinked,
            `${post.permalink} displays all articles with correct links`
          )
        }

        if (post.books) {
          const bookLinks = $('[data-book-link]').toArray()
          const allBooksLinked = post.books.every(book => {
            return bookLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === book.title && linkHref === book.permalink
            })
          })

          t.ok(
            allBooksLinked,
            `${post.permalink} displays all books with correct links`
          )
        }

        if (post.events) {
          const eventLinks = $('[data-event-link]').toArray()
          const allEventsLinked = post.events.every(event => {
            return eventLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === event.title && linkHref === event.permalink
            })
          })

          t.ok(
            allEventsLinked,
            `${post.permalink} displays all events with correct links`
          )
        }
      } catch (err) {
        t.fail(
          `${post.permalink} Person content links: ${err.message}`
        )
      }
    }
  })

  t.test('Verify Demo post maker link', async t => {
    for (const post of allPosts) {
      if (post.contentType !== 'Demo') {
        continue
      }

      const postPath = await resolvePostPath(rootDirectory, exportDirectory, post.permalink)

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })
        const $ = load(postHtml)
        const makerLink = $('[data-maker-link]')

        t.equal(
          makerLink.text(),
          post.maker.title,
          `${post.permalink} maker link has correct title`
        )

        t.equal(
          makerLink.attr('href'),
          `/authors/${post.maker.slug}.html`,
          `${post.permalink} maker link has correct href`
        )
      } catch (err) {
        t.fail(
          `${post.permalink} Demo maker link: ${err.message}`
        )
      }
    }
  })

  t.test('Verify Book/Article post author link', async t => {
    for (const post of allPosts) {
      if (post.contentType !== 'Book' && post.contentType !== 'Article') {
        continue
      }

      const postPath = await resolvePostPath(rootDirectory, exportDirectory, post.permalink)

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })
        const $ = load(postHtml)
        const authorLink = $('[data-author-link]')

        t.equal(
          authorLink.text(),
          post.author.title,
          `${post.permalink} author link has correct title`
        )

        t.equal(
          authorLink.attr('href'),
          `/authors/${post.author.slug}.html`,
          `${post.permalink} author link has correct href`
        )
      } catch (err) {
        t.fail(
          `${post.permalink} Book author link: ${err.message}`
        )
      }
    }
  })

  t.test('Verify custom template rendering', async t => {
    for (const post of allPosts) {
      if (post.template !== 'ReactBadMKay') {
        continue
      }

      const postPath = await resolvePostPath(rootDirectory, exportDirectory, post.permalink)

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })

        t.ok(
          postHtml.includes('mmkaaay?'),
          `${post.permalink} renders custom template content`
        )
      } catch (err) {
        t.fail(
          `${post.permalink} template rendering: ${err.message}`
        )
      }
    }
  })

  t.test('Verify previous/next post links', async t => {
    for (const post of allPosts) {
      const postPath = await resolvePostPath(
        rootDirectory,
        exportDirectory,
        post.permalink
      )

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })
        const $ = load(postHtml)

        if (post.links.previousPost) {
          const prevLink = $('[data-previous-post-link]')
          const prevLinkText = prevLink.text().trim()
          const prevLinkHref = prevLink.attr('href')

          t.equal(
            prevLinkText,
            post.links.previousPost.title,
            `${post.permalink} previous post link has correct title`
          )

          t.equal(
            prevLinkHref,
            post.links.previousPost.permalink,
            `${post.permalink} previous post link has correct href`
          )
        } else {
          t.ok(
            postHtml.includes('this is the first post!'),
            `${post.permalink} displays first post message`
          )
        }

        if (post.links.nextPost) {
          const nextLink = $('[data-next-post-link]')
          const nextLinkText = nextLink.text().trim()
          const nextLinkHref = nextLink.attr('href')

          t.equal(
            nextLinkText,
            post.links.nextPost.title,
            `${post.permalink} next post link has correct title`
          )

          t.equal(
            nextLinkHref,
            post.links.nextPost.permalink,
            `${post.permalink} next post link has correct href`
          )
        } else {
          t.ok(
            postHtml.includes('this is the last post!'),
            `${post.permalink} displays last post message`
          )
        }
      } catch (err) {
        t.fail(
          `${post.permalink} prev/next links: ${err.message}`
        )
      }
    }
  })

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})