/*
 * Homepage Tests
 *
 * Tests that verify the homepage displays all discovered content:
 *   - Title composition (page title + site title)
 *   - Collections are discovered and listed (via collection.md files and aliases)
 *   - All collection posts are rendered correctly
 *   - Facets are listed only when posts use them in front-matter
 *   - Subpages ("Pages" section) are discovered and linked
 */

const { tmpdir } = require('os')
const { join } = require('path')
const { mkdir, rm, readFile, cp, readdir } = require('fs/promises')
const test = require('tape')
const { load } = require('cheerio')
const writ = require('../..')
const { FIXTURE_SETTINGS, FIXTURE_CONTENT_MODEL } = require('./fixtures/model')
const { FACET_BROWSE_PATH, getUsedFacets, flattenPostsFromCategories } = require('./helpers')

const fixturesDirectory = join(__dirname, 'fixtures', 'fs')

test('E2E Magazine - Homepage', async t => {

  const testDir = join(tmpdir(), 'e2e-magazine-homepage-build')
  const rootDirectory = testDir
  const exportDirectory = 'docs'
  let indexHtmlContent

  try {
    await mkdir(testDir, { recursive: true })
    await cp(fixturesDirectory, rootDirectory, { recursive: true })

    await writ.build({
      rootDirectory,
      refreshTheme: true
    })

    indexHtmlContent = await readFile(
      join(rootDirectory, exportDirectory, 'index.html'),
      { encoding: 'utf-8' }
    )
  } catch (err) {
    t.fail(`Build magazine test failed: ${err.message}`)
    return
  }

  t.plan(7)

  const SECTION_HEADINGS_HOMEPAGE = {
    pages: 'Pages'
  }

  const expectedPageTitle = FIXTURE_CONTENT_MODEL.homepage.title
  const expectedSiteTitle = FIXTURE_SETTINGS.title

  const $ = load(indexHtmlContent)
  const pageTitle = $('title').text()

  t.ok(
    pageTitle.includes(expectedPageTitle) &&
    pageTitle.includes(expectedSiteTitle),
    'index.html title contains both homepage title and site title'
  )

  t.ok(
    indexHtmlContent.includes(FIXTURE_CONTENT_MODEL.homepage.content),
    'homepage index.html contains homepage content'
  )

  const outputDirContents = await readdir(join(rootDirectory, exportDirectory))
  const hasIndexHtml = outputDirContents.includes('index.html')
  const hasCollectionDirectories = FIXTURE_CONTENT_MODEL.collections.every(
    collection => outputDirContents.includes(collection.name)
  )

  t.ok(
    hasIndexHtml && hasCollectionDirectories,
    'output directory contains index.html and all collection directories'
  )

  const allCollections = FIXTURE_CONTENT_MODEL.collections

  const collectionsHaveTitleLinks = allCollections.every(collection => {
    const allLinks = $('a').toArray()
    return allLinks.some(link => {
      const linkText = $(link).text()
      const linkHref = $(link).attr('href')
      return (
        linkText.toLowerCase() === collection.name &&
        linkHref === `/${collection.name}`
      )
    })
  })

  t.ok(
    collectionsHaveTitleLinks,
    'all collections are listed with links to their pages'
  )

  const facetsListed = allCollections.every(collection => {
    const usedFacets = getUsedFacets(
      collection.categories,
      collection.posts,
      collection.facets
    )

    if (usedFacets.size === 0) {
      return true
    }

    const facetLinks = $('a').toArray().map(link => ({
      href: $(link).attr('href'),
      text: $(link).text().toLowerCase()
    }))

    const allUsedFacetsFound = Array.from(usedFacets).every(facet => {
      const facetPageHref = `/${collection.name}/${FACET_BROWSE_PATH}/${facet}`
      return facetLinks.some(link =>
        link.text === facet.toLowerCase() && link.href === facetPageHref
      )
    })

    const browsePathExists = facetLinks.some(link =>
      link.href === `/${collection.name}/${FACET_BROWSE_PATH}`
    )

    return allUsedFacetsFound && browsePathExists
  })

  t.ok(
    facetsListed,
    'each collection with facets has all facets and browse link listed'
  )

  const allPostsListed = FIXTURE_CONTENT_MODEL.collections.every(collection => {
    const allLinks = $('a').toArray()

    const allCollectionPosts = flattenPostsFromCategories(
      collection.categories,
      collection.posts
    )

    return allCollectionPosts.every(post => {
      return allLinks.some(link => {
        const linkText = $(link).text()
        const linkHref = $(link).attr('href')
        return linkText === post.title && linkHref === post.permalink
      })
    })
  })

  t.ok(
    allPostsListed,
    'all collection posts from fixture are listed'
  )

  const allLinks = $('a').toArray()

  const allSubpagesListed = FIXTURE_CONTENT_MODEL.subpages.every(subpage => {
    return allLinks.some(link => {
      const linkText = $(link).text()
      const linkHref = $(link).attr('href')
      return linkText === subpage.title && linkHref === subpage.permalink
    })
  })

  t.ok(
    allSubpagesListed,
    'all subpages are listed in the homepage'
  )

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})