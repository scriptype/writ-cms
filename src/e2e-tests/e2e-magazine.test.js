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

/*
 * Finds a header element by collection name from a set of header elements.
 * Iterates through headers using the titleSelector to extract the title text,
 * compares case-insensitively, and returns the Cheerio-wrapped matching element.
 */
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

/*
 * Recursively flattens a nested category tree into a single array of all posts.
 * Combines direct posts with posts from all nested categories at any depth.
 */
const flattenPostsFromCategories = (categories = [], posts = []) => {
  let allPosts = [...posts]

  if (Array.isArray(categories)) {
    for (const category of categories) {
      const categoryPosts = flattenPostsFromCategories(
        category.categories,
        category.posts
      )
      allPosts = [...allPosts, ...categoryPosts]
    }
  }

  return allPosts
}

/*
 * Recursively determines which facets are actually used by any post
 * in the collection and its nested categories. Only returns facets
 * from the provided facetNames list that have at least one post using them.
 */
const getUsedFacets = (
  categories = [],
  posts = [],
  facetNames = []
) => {
  const usedFacets = new Set()

  const processPosts = (postList) => {
    for (const post of postList) {
      for (const facet of facetNames) {
        if (post.hasOwnProperty(facet)) {
          usedFacets.add(facet)
        }
      }
    }
  }

  processPosts(posts)

  if (Array.isArray(categories)) {
    for (const category of categories) {
      processPosts(category.posts || [])
      getUsedFacets(
        category.categories,
        [],
        facetNames
      ).forEach(f => usedFacets.add(f))
    }
  }

  return usedFacets
}

/*
 * Recursively collects all unique values for a given facet across posts
 * and nested categories. Handles both single values and array values.
 * Used to verify that all expected facet values are rendered on /by pages.
 */
const getExpectedFacetValues = (
  facetName,
  categories = [],
  posts = []
) => {
  const values = new Set()

  const processPosts = (postList) => {
    for (const post of postList) {
      if (post.hasOwnProperty(facetName)) {
        const value = post[facetName]
        if (Array.isArray(value)) {
          value.forEach(v => {
            const processedValue = typeof v === 'object' && v.title ? v.title : v
            values.add(processedValue)
          })
        } else if (value) {
          const processedValue = typeof value === 'object' && value.title ? value.title : value
          values.add(processedValue)
        }
      }
    }
  }

  processPosts(posts)

  if (Array.isArray(categories)) {
    for (const category of categories) {
      processPosts(category.posts || [])
      getExpectedFacetValues(
        facetName,
        category.categories || [],
        []
      ).forEach(v => values.add(v))
    }
  }

  return values
}

test('E2E Magazine', t => {

  const testDir = join(tmpdir(), 'e2e-magazine-build')
  const rootDirectory = testDir
  const exportDirectory = 'docs'
  let indexHtmlContent

  /*
   * Stub content model and settings representing the fixture's structure.
   *
   * Facets are only listed if at least one post in the collection uses them
   * in front-matter. Date is automatically added to every post by the system.
   *
   * Linked fields (author, events, organizers, participants) are represented
   * as objects with title and slug properties, mirroring how the compiler
   * transforms linked references.
   */
  const FIXTURE_SETTINGS = {
    title: 'Web Maganize'
  }

  const FIXTURE_CONTENT_MODEL = {
    homepage: {
      title: 'Home',
      date: '2025-11-01',
      content: 'Welcome to E2E Magazine'
    },
    collections: [
      {
        name: 'articles',
        date: '2025-11-02',
        collectionAlias: 'blog',
        categoryContentType: 'BlogTopic',
        categoryAlias: 'topic',
        categoriesAlias: 'topics',
        entryContentType: 'Article',
        entryAlias: 'article',
        entriesAlias: 'articles',
        facets: ['tags', 'date', 'author', 'resources'],
        content: 'Welcome to articles',
        categories: [
          {
            name: 'Guides',
            date: '2025-11-03',
            content: '',
            posts: [
              {
                title: 'Hello Design',
                author: { title: 'Mustafa Enes', slug: 'enes' },
                date: '2025-11-05',
                tags: ['ui', 'ux', 'design', 'css'],
                content: 'Design design design'
              },
              {
                title: 'Introduction to CSS Grid',
                author: { title: 'Mustafa Enes', slug: 'enes' },
                date: '2025-11-06',
                tags: ['css', 'grid', 'art direction', 'design'],
                content: 'All about grid'
              }
            ]
          }
        ],
        posts: [
          {
            title: 'Pure JS very good',
            author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
            date: '2025-11-02',
            tags: ['javascript', 'performance', 'accessibility', 'devx'],
            content: 'pure js very good'
          },
          {
            title: 'React bad',
            author: { title: 'Mustafa Enes', slug: 'enes' },
            date: '2025-11-03',
            tags: ['javascript', 'react', 'performance', 'accessibility', 'devx'],
            content: 'react not good'
          },
          {
            title: 'Vue good',
            author: { title: 'Mustafa Enes', slug: 'enes' },
            date: '2025-11-04',
            tags: ['javascript', 'vue', 'performance', 'accessibility', 'devx'],
            content: 'vue good'
          }
        ]
      },
      {
        name: 'books',
        date: '2025-11-04',
        entryContentType: 'Book',
        entryAlias: 'book',
        entriesAlias: 'books',
        facets: ['author', 'date', 'tags', 'genre'],
        content: '',
        posts: [
          {
            title: 'Football',
            author: { title: 'Sir Alex Ferguson', slug: 'alex' },
            date: '2025-11-04',
            genre: 'sports',
            tags: ['Manchester United', 'English football'],
            content: 'Welcome to football.'
          },
          {
            title: 'HTML',
            author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
            date: '2025-11-05',
            genre: 'technology',
            tags: ['html', 'web', 'internet'],
            content: 'Welcome to hypertext era.'
          }
        ]
      },
      {
        name: 'authors',
        date: '2025-11-05',
        entryContentType: 'Person',
        entryAlias: 'author',
        entriesAlias: 'authors',
        facets: ['events'],
        content: '',
        posts: [
          {
            title: 'Mustafa Enes',
            slug: 'enes',
            date: '2025-11-05',
            events: [
              { title: 'Lets HTML now', slug: 'lets-html-now' },
              { title: 'Lets get together', slug: 'lets-get-together' }
            ],
            content: 'Hey, it\'s me.'
          },
          {
            title: 'Sir Alex Ferguson',
            slug: 'alex',
            date: '2025-11-06',
            events: [{ title: 'ManU - CFC', slug: 'manu-cfc' }],
            content: 'Chewing a gum.'
          },
          {
            title: 'Sir Tim Berners Lee',
            slug: 'tim',
            date: '2025-11-07',
            events: [
              { title: 'Lets HTML now', slug: 'lets-html-now' },
              { title: 'Lets get together', slug: 'lets-get-together' },
              { title: 'What to do', slug: 'what-to-do' }
            ],
            content: ''
          }
        ]
      },
      {
        name: 'demos',
        date: '2025-11-06',
        contentType: 'DemoPortfolio',
        categoryContentType: 'Technology',
        entryContentType: 'Demo',
        categoryAlias: 'technology',
        categoriesAlias: 'technologies',
        entryAlias: 'demo',
        entriesAlias: 'demos',
        facets: ['tags', 'date', 'maker'],
        content: '<h1 id="good-luck-running-these">Good luck running these</h1>',
        categories: [
          {
            name: 'CSS',
            date: '2025-11-07',
            categoryContentType: 'Technique',
            categoryAlias: 'technique',
            categoriesAlias: 'techniques',
            content: '<h1 id="welcome-to-cascade">Welcome to cascade</h1>',
            categories: [
              {
                name: 'CSS Art',
                date: '2025-11-08',
                content: '',
                posts: [
                  {
                    title: 'Carpet Motifs',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-11',
                    tags: ['css', 'art'],
                    content: 'Carpet shapes'
                  },
                  {
                    title: 'Realist Painting',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-12',
                    tags: ['css', 'art', 'painting'],
                    content: 'A lot of css'
                  }
                ]
              },
              {
                name: 'Grid',
                date: '2025-11-09',
                content: '',
                posts: [
                  {
                    title: 'Grid vs Flexbox',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-10',
                    tags: ['css', 'grid', 'flex', 'layout'],
                    content: 'A versus'
                  },
                  {
                    title: 'Hello Grid',
                    maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                    date: '2025-11-09',
                    tags: ['css', 'layout', 'grid'],
                    content: 'let there be grid'
                  }
                ]
              }
            ],
            posts: [
              {
                title: 'Hello CSS',
                maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                date: '2025-11-08',
                tags: ['css', 'tutorial'],
                content: 'there is css'
              }
            ]
          },
          {
            name: 'Three.js',
            date: '2025-11-10',
            categoryContentType: 'Technique',
            categoryAlias: 'technique',
            categoriesAlias: 'techniques',
            content: '<h1 id="welcome-to-three-stuff">Welcome to three stuff</h1>',
            categories: [
              {
                name: 'Sprite',
                date: '2025-11-11',
                content: '',
                posts: [
                  {
                    title: 'Minesweeper',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-10',
                    tags: ['game'],
                    content: 'A Classic'
                  },
                  {
                    title: 'Stickman',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-11',
                    tags: ['game'],
                    content: 'stickman demo'
                  }
                ]
              },
              {
                name: 'WebGPU',
                date: '2025-11-12',
                content: '',
                posts: [
                  {
                    title: 'Ipsum demo',
                    date: '2025-11-12',
                    content: ''
                  },
                  {
                    title: 'Lorem Demo',
                    date: '2025-11-13',
                    content: ''
                  }
                ]
              }
            ],
            posts: [
              {
                title: 'Intelligent Drum n Bass',
                maker: { title: 'Mustafa Enes', slug: 'enes' },
                date: '2025-11-08',
                tags: ['reproduction', 'music', 'cars', 'visual effects'],
                content: 'Impala on the F ring'
              },
              {
                title: 'Simple 3D',
                maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                date: '2025-11-09',
                content: 'Some simple 3d demo'
              }
            ]
            }
            ],
            posts: [
            {
            title: 'Hello World',
            maker: { title: 'Mustafa Enes', slug: 'enes' },
            date: '2025-11-06',
            tags: ['html', 'hello world'],
            content: '<h1>Hello world</h1>\n\n<p>Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>'
            },
            {
            title: 'good-morning-world',
            maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
            date: '2025-11-07',
            tags: ['html', 'attributes', 'good morning'],
            content: '<h1>Good morning world</h1>\n\n<p align="center">Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>'
            }
            ]
      },
      {
        name: 'events',
        date: '2025-11-13',
        entryContentType: 'Event',
        facets: [],
        content: '',
        posts: [
          {
            title: 'Lets HTML now',
            date: '2025-11-13',
            organizers: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
            participants: [{ title: 'Mustafa Enes', slug: 'enes' }],
            content: 'html good'
          },
          {
            title: 'Lets get together',
            date: '2025-11-13',
            organizers: [
              { title: 'Mustafa Enes', slug: 'enes' },
              { title: 'Sir Tim Berners Lee', slug: 'tim' }
            ],
            content: 'And call it an event'
          },
          {
            title: 'ManU - CFC',
            date: '2025-11-13',
            participants: [{ title: 'Sir Alex Ferguson', slug: 'alex' }],
            content: ''
          },
          {
            title: 'What to do',
            date: '2025-11-13',
            participants: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
            content: ''
          }
        ]
      }
    ],
    subpages: [
      {
        href: '/about-us.html',
        date: '2025-11-14',
        content: 'Something about us'
      },
      {
        href: '/newsletter.html',
        date: '2025-11-15',
        content: 'Sign up now'
      }
    ]
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
      ...c,
      fileName: c.alias
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

      t.ok(
        indexHtmlContent.includes(FIXTURE_CONTENT_MODEL.homepage.content),
        'homepage index.html contains homepage content'
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

        const hasLink = titleLink.length === 1
        const hasPostList = postList.length === 1

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

        const usedFacets = getUsedFacets(
          collection.categories,
          collection.posts,
          collection.facets
        )

        if (usedFacets.size === 0) {
          return facetsContainer.length === 0
        }

        const facetLinks = facetsContainer.find('a')
        const facetTexts = facetLinks.map((_, link) => $(link).text().toLowerCase()).get()

        const allUsedFacetsFound = Array.from(usedFacets).every(facet =>
          facetTexts.includes(facet.toLowerCase())
        )

        const browseLink = facetLinks.toArray().find(link =>
          $(link).attr('href') === `/${collection.name}/${FACET_BROWSE_PATH}`
        )
        const browsePathExists = browseLink !== undefined

        return allUsedFacetsFound && browsePathExists
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

        const allCollectionPosts = flattenPostsFromCategories(
          collection.categories,
          collection.posts
        )

        return allCollectionPosts.every(post =>
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
      const subpagesSectionFound = pagesHeading.length === 1

      let allSubpagesListed = false
      if (subpagesSectionFound) {
        const subpagesList = pagesHeading.next(HOMEPAGE_DOM_SELECTORS.subpagesList)
        const subpageLinks = subpagesList.find('a')
        const pageHrefs = subpageLinks.map((_, link) => $(link).attr('href')).get()

        allSubpagesListed = FIXTURE_CONTENT_MODEL.subpages.every(subpage =>
          pageHrefs.includes(subpage.href)
        )
      }

      t.ok(
        allSubpagesListed,
        'all subpages are listed under Pages section'
      )


    } catch (err) {
      t.fail(`Build magazine test failed: ${err.message}`)
    }
  })

  t.test('Verify individual collection pages', async t => {

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
        collectionTitleLink.length === 1 &&
        collectionTitleLink.text().toLowerCase() === collection.name
      )

      t.ok(
        hasValidTitle,
        `${collection.name} collection page has a valid title`
      )

      if (collection.content) {
        t.ok(
          collectionHtml.includes(collection.content),
          `${collection.name} collection index.html contains collection content`
        )
      }

      const facetsContainer = $(COLLECTION_DOM_SELECTORS.collectionFacets)
      const hasFacetsContainer = facetsContainer.length === 1

      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      if (usedFacets.size === 0) {
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

        const allUsedFacetsFound = Array.from(usedFacets).every(facet =>
          facetTexts.includes(facet.toLowerCase())
        )

        t.ok(
          allUsedFacetsFound,
          `${collection.name} displays all expected facets`
        )

        // Verify that declared but unused facets are not rendered
        const unusedFacets = collection.facets.filter(
          facet => !usedFacets.has(facet)
        )
        const noUnusedFacetsRendered = unusedFacets.every(facet =>
          !facetTexts.includes(facet.toLowerCase())
        )

        t.ok(
          noUnusedFacetsRendered,
          `${collection.name} does not display unused facets`
        )
      }

      const postsByCategoriesSelector = (
        `${COLLECTION_DOM_SELECTORS.postsHeading}` +
        `:contains("${SECTION_HEADINGS.postsByCategories}")`
      )
      const postsByCategoriesHeading = $(postsByCategoriesSelector)
      const hasCategoriesSection = postsByCategoriesHeading.length === 1

      t.ok(
        hasCategoriesSection,
        `${collection.name} has posts by categories section`
      )

      if (hasCategoriesSection) {
        const categoryHeadings = postsByCategoriesHeading.nextUntil(
          COLLECTION_DOM_SELECTORS.postsHeading
        ).filter(COLLECTION_DOM_SELECTORS.categoryHeading)

        const hasCategories = categoryHeadings.length !== 0

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

        const allCollectionPosts = flattenPostsFromCategories(
          collection.categories,
          collection.posts
        )
        const expectedPostCount = allCollectionPosts.length

        t.ok(
          categorizedPostCount === expectedPostCount,
          `${collection.name} posts by categories contains exactly ${expectedPostCount} posts`
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

      const allPostsForCollection = flattenPostsFromCategories(
        collection.categories,
        collection.posts
      )
      const expectedAllPostsCount = allPostsForCollection.length

      t.ok(
        allPostsCount === expectedAllPostsCount,
        `${collection.name} all posts list contains exactly ${expectedAllPostsCount} posts`
      )
    }
  })

  t.test('Verify facet browse pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      if (usedFacets.size === 0) {
        continue
      }

      const facetBrowsePath = join(
        rootDirectory,
        exportDirectory,
        collection.name,
        FACET_BROWSE_PATH,
        'index.html'
      )

      const facetBrowseHtml = await readFile(
        facetBrowsePath,
        { encoding: 'utf-8' }
      )

      const $ = load(facetBrowseHtml)

      const mainUl = $('body > ul')
      const facetLis = mainUl.find('> li').toArray()
      const renderedFacetNames = facetLis.map(li =>
        $(li).find('> a').text()
      )

      const facetCountsCorrect = Array.from(usedFacets).every(facet => {
        const facetCount = renderedFacetNames.filter(
          name => name === facet
        ).length
        return facetCount === 1
      })

      const facetValuesCorrect = Array.from(usedFacets).every(facet => {
        const facetLi = facetLis.find(li =>
          $(li).find('> a').text() === facet
        )

        const nestedUl = $(facetLi).find('> ul')
        const valueLinks = nestedUl.find('> li > a')
        const renderedValues = valueLinks.toArray().map(link =>
          $(link).text()
        )

        const uniqueValues = new Set(renderedValues)
        const valuesAreUnique = uniqueValues.size === renderedValues.length
        const hasValues = renderedValues.length !== 0

        const expectedValues = getExpectedFacetValues(
          facet,
          collection.categories,
          collection.posts
        )

        const allExpectedValuesPresent = Array.from(expectedValues).every(
          expectedValue => renderedValues.includes(expectedValue)
        )

        return valuesAreUnique && hasValues && allExpectedValuesPresent
      })

      const allUsedFacetsListed = facetCountsCorrect && facetValuesCorrect

      t.ok(
        allUsedFacetsListed,
        `${collection.name} /by page lists all used facets exactly once with unique values`
      )

      // Verify that declared but unused facets are not rendered on /by page
      const unusedFacets = collection.facets.filter(
        facet => !usedFacets.has(facet)
      )
      const noUnusedFacetsRendered = unusedFacets.every(facet =>
        !renderedFacetNames.includes(facet)
      )

      t.ok(
        noUnusedFacetsRendered,
        `${collection.name} /by page does not display unused facets`
      )
    }
  })

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
