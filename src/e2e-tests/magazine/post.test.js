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

        t.ok(
          postHtml.includes(post.title),
          `${post.permalink} displays post title`
        )

        if (post.content) {
          t.ok(
            postHtml.replace(/\r\n/g, '\n').includes(post.content),
            `${post.permalink} contains post content`
          )
        }

        const allLinks = $('a').toArray()
        const collectionLink = allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return (
            linkText === post.context.collection.name &&
            linkHref === post.context.collection.permalink
          )
        })

        t.ok(
          collectionLink,
          `${post.context.collection.name}${post.permalink} has breadcrumb link to collection`
        )

        const allCategoryLinksPresent = post.context.categories.every(cat => {
          return allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === cat.title && linkHref === cat.permalink
          })
        })

        t.ok(
          allCategoryLinksPresent,
          `${post.context.collection.name}${post.permalink} has breadcrumb links to all categories`
        )
      } catch (err) {
        t.fail(
          `${post.permalink} page: ${err.message}`
        )
      }
    }
  })

  t.test('Verify previous/next post links', async t => {
    for (const post of allPosts) {
      const postPath = await resolvePostPath(rootDirectory, exportDirectory, post.permalink)

      try {
        const postHtml = await readFile(postPath, { encoding: 'utf-8' })
        const $ = load(postHtml)
        const allLinks = $('a').toArray()

        if (post.links.previousPost) {
          const hasPrevLink = allLinks.some(link => {
            const linkText = $(link).text().trim()
            return (
              linkText === post.links.previousPost.title &&
              $(link).attr('href') === post.links.previousPost.permalink
            )
          })

          t.ok(
            hasPrevLink,
            `${post.permalink} has link to previous post`
          )

          if (!hasPrevLink) {
            console.log(`

            ======

            previous post link not found


            ---
            `)
            console.log('linkTexts', allLinks.map(link => $(link).text().trim()))
            console.log('previousPost.title', post.links.previousPost.title)
            console.log(`
            ---
            `)
            console.log('linkHrefs', allLinks.map(link => $(link).attr('href')))
            console.log('previousPost.permalink', post.links.previousPost.permalink)
            console.log(`
            ---

            ======

            `)
          }
        }

        if (post.links.nextPost) {
          const hasNextLink = allLinks.some(link => {
            const linkText = $(link).text().trim()
            return (
              linkText === post.links.nextPost.title &&
              $(link).attr('href') === post.links.nextPost.permalink
            )
          })

          t.ok(
            hasNextLink,
            `${post.permalink} has link to next post`
          )

          if (!hasNextLink) {
            console.log(`

            ======

            next post link not found


            ---
            `)
            console.log('linkTexts', allLinks.map(link => $(link).text().trim()))
            console.log('nextPost.title', post.links.nextPost.title)
            console.log(`
            ---
            `)
            console.log('linkHrefs', allLinks.map(link => $(link).attr('href')))
            console.log('nextPost.permalink', post.links.nextPost.permalink)
            console.log(`
            ---

            ======

            `)
          }
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
