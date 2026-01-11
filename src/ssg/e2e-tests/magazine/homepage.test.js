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

  const $ = load(indexHtmlContent)

  const pageTitle = $('title').text()

  t.ok(
    pageTitle.includes(FIXTURE_CONTENT_MODEL.homepage.title) &&
    pageTitle.includes(FIXTURE_SETTINGS.title),
    'page title contains both homepage title and site title'
  )

  t.ok(
    indexHtmlContent.includes(FIXTURE_CONTENT_MODEL.homepage.content),
    'index.html contains homepage content'
  )

  const outputDirContents = await readdir(join(rootDirectory, exportDirectory))
  const hasIndexHtml = outputDirContents.includes('index.html')
  const hasCollectionDirectories = FIXTURE_CONTENT_MODEL.collections.every(
    collection => outputDirContents.includes(collection.slug)
  )

  t.ok(
    hasIndexHtml && hasCollectionDirectories,
    'output directory has index.html and all collections'
  )

  const collectionLinks = $('[data-collection-link]').toArray()

  t.equal(
    collectionLinks.length,
    FIXTURE_CONTENT_MODEL.collections.length,
    'collection link count is correct'
  )

  const allCollectionsLinked =
    FIXTURE_CONTENT_MODEL.collections.every(collection => {
      return collectionLinks.some(link => {
        const linkText = $(link).text()
        const linkHref = $(link).attr('href')
        return (
          linkText === collection.title &&
          linkHref === `/${collection.slug}`
        )
      })
    })

  t.true(allCollectionsLinked, 'all collections have title links')

  const allFacetNameLinks = $('[data-facet-name-link]').toArray()

  const facetsListed = FIXTURE_CONTENT_MODEL.collections.every(collection => {
    const usedFacets = getUsedFacets(
      collection.categories,
      collection.posts,
      collection.facets
    )

    if (!usedFacets.size) {
      return true
    }

    const facetNameLinks = allFacetNameLinks.filter(link => {
      const linkHref = $(link).attr('href')
      return linkHref.includes(`/${collection.slug}/`)
    })

    t.equal(
      facetNameLinks.length,
      usedFacets.size,
      `${collection.slug} facet link count is correct`
    )

    const allUsedFacetsFound = Array.from(usedFacets).every(facet => {
      const facetPageHref = `/${collection.slug}/${FACET_BROWSE_PATH}/${facet}`
      return facetNameLinks.some(link => {
        const linkText = $(link).text()
        const linkHref = $(link).attr('href')
        return linkText === facet && linkHref === facetPageHref
      })
    })

    const facetBrowseLink = $('[data-facet-browse-link]').toArray().find(link => {
      const linkHref = $(link).attr('href')
      return linkHref === `/${collection.slug}/${FACET_BROWSE_PATH}`
    })

    return allUsedFacetsFound && !!facetBrowseLink
  })

  t.true(facetsListed, 'collections with facets have all facets and browse link')

  const postLinks = $('[data-post-link]').toArray()
  const allPosts = FIXTURE_CONTENT_MODEL.collections.flatMap(collection =>
    flattenPostsFromCategories(collection.categories, collection.posts)
  )

  t.equal(postLinks.length, allPosts.length, 'post link count is correct')

  const allPostsListed = FIXTURE_CONTENT_MODEL.collections.every(collection => {
    const allCollectionPosts = flattenPostsFromCategories(
      collection.categories,
      collection.posts
    )

    return allCollectionPosts.every(post => {
      return postLinks.some(link => {
        const linkText = $(link).text()
        const linkHref = $(link).attr('href')
        return linkText === post.title && linkHref === post.permalink
      })
    })
  })

  t.true(allPostsListed, 'all posts are listed')

  const subpageLinks = $('[data-subpage-link]').toArray()

  t.equal(
    subpageLinks.length,
    FIXTURE_CONTENT_MODEL.subpages.length,
    'subpage link count is correct'
  )

  const allSubpagesListed = FIXTURE_CONTENT_MODEL.subpages.every(subpage => {
    return subpageLinks.some(link => {
      const linkText = $(link).text()
      const linkHref = $(link).attr('href')
      return linkText === subpage.title && linkHref === subpage.permalink
    })
  })

  t.true(allSubpagesListed, 'all subpages are listed')

  const assetLinks = $('[data-asset-link]').toArray()

  t.equal(
    assetLinks.length,
    FIXTURE_CONTENT_MODEL.assets.length,
    'asset link count is correct'
  )

  const allAssetsListed = FIXTURE_CONTENT_MODEL.assets.every(asset => {
    return assetLinks.some(link => {
      const linkText = $(link).text()
      const linkHref = $(link).attr('href')
      return linkText === asset.title && linkHref === asset.permalink
    })
  })

  t.true(allAssetsListed, 'all assets are listed')

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
