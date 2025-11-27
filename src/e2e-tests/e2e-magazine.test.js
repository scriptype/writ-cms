/*
 * E2E Magazine Test
 *
 * This test suite validates that the content model is correctly recognized,
 * processed, and rendered by writ. It builds the magazine fixture once and
 * reuses the output across multiple test suites to verify:
 *
 * Homepage Tests:
 *   - Title composition (page title + site title)
 *   - Collections are discovered and listed (via collection.md files and aliases)
 *   - All collection posts are rendered correctly
 *   - Facets are listed only when posts use them in front-matter
 *   - Subpages ("Pages" section) are discovered and linked
 *   - Post counts in output directories match fixture definitions
 *
 * Collection Page Tests:
 *   - Each collection page has a valid title
 *   - Facets are displayed correctly on collection pages
 *   - Posts are organized by categories (with category headings)
 *   - All posts section displays complete post list
 *   - Post counts match fixture definitions
 *
 * Test Data:
 *   - FIXTURE_SETTINGS contains site-wide configuration (title)
 *   - FIXTURE_CONTENT_MODEL defines expected structure: homepage, 5 collections
 *     (articles, books, authors, demos, events) with posts, facets, and aliases,
 *     plus subpages. This is the single source of truth for all assertions.
 *
 * Helpers:
 *   - findHeaderByCollectionName(): Locates collection sections by name
 *   - countPostFiles(): Recursively counts .html files in collection directories
 *   - DOM_SELECTORS: Centralized selectors for easy updates when markup changes
 */

const { tmpdir } = require('os')
const { join } = require('path')
const { readdir, mkdir, rm, readFile, cp, stat } = require('fs/promises')
const test = require('tape')
const { load } = require('cheerio')
const writ = require('..')

const fixturesDirectory = join(__dirname, 'fixtures', 'e2e-magazine')

const FACET_BROWSE_PATH = 'by'

const findHeaderByCollectionName = ($, headers, collectionName, titleSelector) => {
  let foundHeader = null

  headers.each((_, header) => {
    const titleElement = $(header).find(titleSelector)
    const titleText = titleElement.text()
    const isCorrectCollection = titleText.toLowerCase() === collectionName

    if (isCorrectCollection) {
      foundHeader = header
      return false
    }
  })

  return foundHeader ? $(foundHeader) : null
}

const countPostFiles = async (dirPath) => {
  let count = 0

  const entries = await readdir(dirPath)

  for (const entry of entries) {
    if (entry === 'index.html' || entry === FACET_BROWSE_PATH) {
      continue
    }

    const fullPath = join(dirPath, entry)
    const fileStats = await stat(fullPath)

    if (fileStats.isDirectory()) {
      count += await countPostFiles(fullPath)
    } else if (entry.endsWith('.html')) {
      count++
    }
  }

  return count
}

test('E2E Magazine', t => {

  const testDir = join(tmpdir(), 'e2e-magazine-build')
  const rootDirectory = testDir
  const exportDirectory = 'docs'
  let indexHtmlContent

  // Stub content model and settings representing the fixture's structure
  // Facets are only listed if at least one post in the collection uses them in front-matter
  // Date is automatically added to every post by the system
  const FIXTURE_SETTINGS = {
    title: 'Web Maganize'
  }

  const FIXTURE_CONTENT_MODEL = {
    homepage: {
      title: 'Home'
    },
    collections: [
      {
        name: 'articles',
        alias: 'blog',
        facets: ['tags', 'date', 'author'],
        posts: [
          { title: 'Pure JS very good' },
          { title: 'React bad' },
          { title: 'Vue good' },
          { title: 'Hello Design', category: 'guides' },
          { title: 'Introduction to CSS Grid', category: 'guides' }
        ]
      },
      {
        name: 'books',
        facets: ['author', 'date', 'tags', 'genre'],
        posts: [
          { title: 'Football' },
          { title: 'HTML' }
        ]
      },
      {
        name: 'authors',
        facets: ['events'],
        posts: [
          { title: 'Mustafa Enes' },
          { title: 'Sir Alex Ferguson' },
          { title: 'Sir Tim Berners Lee' }
        ]
      },
      {
        name: 'demos',
        facets: ['tags', 'date', 'maker'],
        posts: [
          { title: 'hello-world' },
          { title: 'good-morning-world' }
        ]
      },
      {
        name: 'events',
        facets: [],
        posts: [
          { title: 'Lets HTML now' },
          { title: 'Lets get together' },
          { title: 'ManU - CFC' },
          { title: 'What to do' }
        ]
      }
    ],
    subpages: ['/about-us.html', '/newsletter.html']
  }

  t.test('Verify homepage displays all discovered content', async t => {
    t.plan(9)

    const HOMEPAGE_DOM_SELECTORS = {
      pageTitle: 'title',
      collectionHeader: 'header',
      collectionTitle: 'h3',
      collectionTitleLink: 'a',
      collectionPostList: 'ul, ol',
      collectionFacets: '.collection-facets',
      subpagesHeading: 'h2',
      subpagesList: 'ul, ol'
    }

    const SECTION_HEADINGS_HOMEPAGE = {
      pages: 'Pages'
    }

    const expectedPageTitle = FIXTURE_CONTENT_MODEL.homepage.title
    const expectedSiteTitle = FIXTURE_SETTINGS.title

    const collectionsWithMetadata = FIXTURE_CONTENT_MODEL.collections.filter(c => !c.alias)
    const collectionsViaAlias = FIXTURE_CONTENT_MODEL.collections.filter(c => c.alias).map(c => ({
      name: c.name,
      fileName: c.alias,
      facets: c.facets
    }))

    try {
      await mkdir(testDir, { recursive: true })
      await cp(fixturesDirectory, rootDirectory, { recursive: true })

      await writ.build({
        rootDirectory
      })

      indexHtmlContent = await readFile(
        join(rootDirectory, exportDirectory, 'index.html'),
        { encoding: 'utf-8' }
      )

      const $ = load(indexHtmlContent)
      const pageTitle = $(HOMEPAGE_DOM_SELECTORS.pageTitle).text()

      t.ok(
        pageTitle.includes(expectedPageTitle) && pageTitle.includes(expectedSiteTitle),
        'index.html title contains both homepage title and site title'
      )

      const outputDirContents = await readdir(join(rootDirectory, exportDirectory))
      const hasIndexHtml = outputDirContents.includes('index.html')
      const hasCollectionDirectories = collectionsWithMetadata.every(
        collection => outputDirContents.includes(collection.name)
      )

      t.ok(
        hasIndexHtml && hasCollectionDirectories,
        'output directory contains index.html and all collection directories'
      )

      const allCollectionsListed = collectionsWithMetadata.every(
        collection => indexHtmlContent.includes(collection.name)
      )

      t.ok(
        allCollectionsListed,
        'all collections with metadata are referenced in index.html'
      )

      const collectionsViaAliasListed = collectionsViaAlias.every(
        collection => indexHtmlContent.includes(collection.name)
      )

      t.ok(
        collectionsViaAliasListed,
        'all collections declared via alias are listed in index.html'
      )

      const allCollections = [...collectionsWithMetadata, ...collectionsViaAlias]
      const headers = $(HOMEPAGE_DOM_SELECTORS.collectionHeader)

      const collectionStructureIsValid = allCollections.every(collection => {
        const collectionHeader = findHeaderByCollectionName(
          $,
          headers,
          collection.name,
          HOMEPAGE_DOM_SELECTORS.collectionTitle
        )

        if (!collectionHeader) {
          return false
        }

        const titleElement = collectionHeader.find(HOMEPAGE_DOM_SELECTORS.collectionTitle)
        const titleLink = titleElement.find(HOMEPAGE_DOM_SELECTORS.collectionTitleLink)
        const postList = collectionHeader.next(HOMEPAGE_DOM_SELECTORS.collectionPostList)

        const hasLink = titleLink.length > 0
        const hasPostList = postList.length > 0

        return hasLink && hasPostList
      })

      t.ok(
        collectionStructureIsValid,
        'each collection is listed with its title as a link and its posts'
      )

      const facetsListed = allCollections.every(collection => {
        const collectionHeader = findHeaderByCollectionName(
          $,
          headers,
          collection.name,
          HOMEPAGE_DOM_SELECTORS.collectionTitle
        )

        if (!collectionHeader) {
          return false
        }

        const facetsContainer = collectionHeader.find(HOMEPAGE_DOM_SELECTORS.collectionFacets)

        if (collection.facets.length === 0) {
          return facetsContainer.length === 0
        }

        const facetLinks = facetsContainer.find('a')
        const facetTexts = facetLinks.map((_, link) => $(link).text().toLowerCase()).get()

        const allFacetsFound = collection.facets.every(facet =>
          facetTexts.includes(facet.toLowerCase())
        )

        const browseLink = facetLinks.toArray().find(link =>
          $(link).attr('href') === `/${collection.name}/${FACET_BROWSE_PATH}`
        )
        const browsePathExists = browseLink !== undefined

        return allFacetsFound && browsePathExists
      })

      t.ok(
        facetsListed,
        'each collection with facets has all facets and browse link listed next to its title'
      )

      const allPostsListed = FIXTURE_CONTENT_MODEL.collections.every(collection => {
        const collectionHeader = findHeaderByCollectionName(
          $,
          $(HOMEPAGE_DOM_SELECTORS.collectionHeader),
          collection.name,
          HOMEPAGE_DOM_SELECTORS.collectionTitle
        )

        if (!collectionHeader) {
          return false
        }

        const postList = collectionHeader.next(HOMEPAGE_DOM_SELECTORS.collectionPostList)
        const postLinks = postList.find('a')
        const postTexts = postLinks.map((_, link) => $(link).text()).get()

        return collection.posts.every(post =>
          postTexts.includes(post.title)
        )
      })

      t.ok(
        allPostsListed,
        'all collection posts from fixture are listed in their respective collections'
      )

      const pagesHeading = $(
        `${HOMEPAGE_DOM_SELECTORS.subpagesHeading}:contains("${SECTION_HEADINGS_HOMEPAGE.pages}")`
      )
      const subpagesSectionFound = pagesHeading.length > 0

      let allSubpagesListed = false
      if (subpagesSectionFound) {
        const subpagesList = pagesHeading.next(HOMEPAGE_DOM_SELECTORS.subpagesList)
        const subpageLinks = subpagesList.find('a')
        const pageHrefs = subpageLinks.map((_, link) => $(link).attr('href')).get()

        allSubpagesListed = FIXTURE_CONTENT_MODEL.subpages.every(subpage =>
          pageHrefs.includes(subpage)
        )
      }

      t.ok(
        allSubpagesListed,
        'all subpages are listed under Pages section'
      )

      const postCountChecks = await Promise.all(
        FIXTURE_CONTENT_MODEL.collections.map(
          async (collection) => {
            const collectionDir = join(rootDirectory, exportDirectory, collection.name)

            try {
              const actualCount = await countPostFiles(collectionDir)
              return actualCount === collection.posts.length
            } catch {
              return false
            }
          }
        )
      )

      const postCountsValid = postCountChecks.every(Boolean)

      t.ok(
        postCountsValid,
        'each collection directory contains expected number of post files'
      )
    } catch (err) {
      t.fail(`Build magazine test failed: ${err.message}`)
    }
  })

  t.test('Verify individual collection pages', async t => {
    t.plan(34)

    const COLLECTION_DOM_SELECTORS = {
      collectionTitle: 'h2 a',
      collectionFacets: '.collection-facets',
      postsHeading: 'h3',
      categoryHeading: 'h4',
      postLists: 'ul'
    }

    const SECTION_HEADINGS = {
      postsByCategories: 'Posts by categories',
      allPosts: 'All posts'
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      const collectionIndexPath = join(
        rootDirectory,
        exportDirectory,
        collection.name,
        'index.html'
      )

      const collectionHtml = await readFile(
        collectionIndexPath,
        { encoding: 'utf-8' }
      )

      const $ = load(collectionHtml)

      const collectionTitleLink = $(COLLECTION_DOM_SELECTORS.collectionTitle)
      const hasValidTitle = (
        collectionTitleLink.length > 0 &&
        collectionTitleLink.text().toLowerCase() === collection.name
      )

      t.ok(
        hasValidTitle,
        `${collection.name} collection page has a valid title`
      )

      const facetsContainer = $(COLLECTION_DOM_SELECTORS.collectionFacets)
      const hasFacetsContainer = facetsContainer.length > 0

      if (collection.facets.length === 0) {
        t.ok(
          !hasFacetsContainer,
          `${collection.name} does not have facets container`
        )
      } else {
        t.ok(
          hasFacetsContainer,
          `${collection.name} has facets container`
        )

        const facetLinks = facetsContainer.find('a')
        const facetTexts = facetLinks
          .map((_, link) => $(link).text().toLowerCase())
          .get()

        const allFacetsFound = collection.facets.every(facet =>
          facetTexts.includes(facet.toLowerCase())
        )

        t.ok(
          allFacetsFound,
          `${collection.name} displays all expected facets`
        )
      }

      const postsByCategoriesSelector = (
        `${COLLECTION_DOM_SELECTORS.postsHeading}` +
        `:contains("${SECTION_HEADINGS.postsByCategories}")`
      )
      const postsByCategoriesHeading = $(postsByCategoriesSelector)
      const hasCategoriesSection = postsByCategoriesHeading.length > 0

      t.ok(
        hasCategoriesSection,
        `${collection.name} has posts by categories section`
      )

      if (hasCategoriesSection) {
        const categoryHeadings = postsByCategoriesHeading.nextUntil(
          COLLECTION_DOM_SELECTORS.postsHeading
        ).filter(COLLECTION_DOM_SELECTORS.categoryHeading)

        const hasCategories = categoryHeadings.length > 0

        t.ok(
          hasCategories,
          `${collection.name} has category headings in posts by categories section`
        )

        const categoryPostLists = postsByCategoriesHeading.nextUntil(
          COLLECTION_DOM_SELECTORS.postsHeading
        ).filter(COLLECTION_DOM_SELECTORS.postLists)

        const categorizedPostCount = categoryPostLists.toArray().reduce(
          (sum, list) => sum + $(list).find('li').length,
          0
        )

        t.ok(
          categorizedPostCount === collection.posts.length,
          `${collection.name} posts by categories contains exactly ${collection.posts.length} posts`
        )
      } else {
        // Defensive checks: Collection pages should always have "Posts by categories" section.
        // These only fail if the collection page structure changed unexpectedly.
        t.fail(`${collection.name} missing posts by categories section`)
        t.fail(`${collection.name} missing category headings`)
      }

      const allPostsSelector = (
        `${COLLECTION_DOM_SELECTORS.postsHeading}` +
        `:contains("${SECTION_HEADINGS.allPosts}")`
      )
      const allPostsHeading = $(allPostsSelector)

      const allPostsList = allPostsHeading.next(COLLECTION_DOM_SELECTORS.postLists)
      const allPostsCount = allPostsList.find('li').length

      t.ok(
        allPostsCount === collection.posts.length,
        `${collection.name} all posts list contains exactly ${collection.posts.length} posts`
      )
    }
  })

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
