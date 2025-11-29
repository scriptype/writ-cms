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
 *
 * Collection Page Tests:
 *   - Each collection page has a valid title
 *   - Facets are displayed correctly on collection pages
 *   - Posts are organized by categories (with category headings)
 *   - All posts section displays complete post list
 *
 * Test Data:
 *   - FIXTURE_SETTINGS contains site-wide configuration (title)
 *   - FIXTURE_CONTENT_MODEL defines expected structure: homepage, 5 collections
 *     (articles, books, authors, demos, events) with posts, facets, and aliases,
 *     plus subpages. This is the single source of truth for all assertions.
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
 * Returns raw facet values (can be strings or objects with title/slug).
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
            values.add(v)
          })
        } else if (value) {
          values.add(value)
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

/*
 * Gets the facet value slug for use in URL construction.
 * For linked facets (objects with slug), returns the slug.
 * For string values, returns the slugified string.
 */
const getFacetValueSlug = (facetValue) => {
  if (typeof facetValue === 'object' && facetValue.slug) {
    return facetValue.slug
  }
  return typeof facetValue === 'string' ?
    writ.helpers.slug(facetValue) :
    facetValue
}

/*
 * Gets the facet value title for display and matching.
 * For linked facets (objects with title), returns the title.
 * Otherwise returns the value as-is.
 */
const getFacetValueTitle = (facetValue) => {
  if (typeof facetValue === 'object' && facetValue.title) {
    return facetValue.title
  }
  return facetValue
}

/*
 * Recursively collects all posts from a category and its subcategories.
 */
const flattenCategoryPosts = (category) => {
  let allPosts = [...(category.posts || [])]

  if (Array.isArray(category.categories)) {
    for (const subCategory of category.categories) {
      allPosts = [...allPosts, ...flattenCategoryPosts(subCategory)]
    }
  }

  return allPosts
}

test('E2E Magazine', async t => {

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
    title: 'Web Magazine'
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
            slug: 'guides',
            date: '2025-11-03',
            content: '',
            posts: [
              {
                title: 'Hello Design',
                author: { title: 'Mustafa Enes', slug: 'enes' },
                date: '2025-11-05',
                permalink: '/articles/guides/hello-design.html',
                tags: ['ui', 'ux', 'design', 'css'],
                content: 'Design design design'
              },
              {
                title: 'Introduction to CSS Grid',
                author: { title: 'Mustafa Enes', slug: 'enes' },
                date: '2025-11-06',
                permalink: '/articles/guides/introduction-to-css-grid.html',
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
            permalink: '/articles/pure-js-very-good.html',
            tags: ['javascript', 'performance', 'accessibility', 'devx'],
            content: 'pure js very good'
          },
          {
            title: 'React bad',
            author: { title: 'Mustafa Enes', slug: 'enes' },
            date: '2025-11-03',
            permalink: '/articles/react-bad.html',
            tags: ['javascript', 'react', 'performance', 'accessibility', 'devx'],
            content: 'react not good'
          },
          {
            title: 'Vue good',
            author: { title: 'Mustafa Enes', slug: 'enes' },
            date: '2025-11-04',
            permalink: '/articles/vue-good.html',
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
        categories: [],
        posts: [
          {
            title: 'Football',
            author: { title: 'Sir Alex Ferguson', slug: 'alex' },
            date: '2025-11-04',
            permalink: '/books/football.html',
            genre: 'sports',
            tags: ['Manchester United', 'English football'],
            content: 'Welcome to football.'
          },
          {
            title: 'HTML',
            author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
            date: '2025-11-05',
            permalink: '/books/html.html',
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
        categories: [],
        posts: [
          {
            title: 'Mustafa Enes',
            slug: 'enes',
            date: '2025-11-05',
            permalink: '/authors/enes.html',
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
            permalink: '/authors/alex.html',
            events: [{ title: 'ManU - CFC', slug: 'manu-cfc' }],
            content: 'Chewing a gum.'
          },
          {
            title: 'Sir Tim Berners Lee',
            slug: 'tim',
            date: '2025-11-07',
            permalink: '/authors/tim.html',
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
            slug: 'css',
            title: 'Cascade all the way',
            date: '2025-11-07',
            categoryContentType: 'Technique',
            categoryAlias: 'technique',
            categoriesAlias: 'techniques',
            content: '<h1 id="welcome-to-cascade">Welcome to cascade</h1>',
            categories: [
              {
                name: 'CSS Art',
                slug: 'css-art',
                date: '2025-11-08',
                content: '',
                posts: [
                  {
                    title: 'Carpet Motifs',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-11',
                    permalink: '/demos/css/css-art/carpet-motifs',
                    tags: ['css', 'art'],
                    content: 'Carpet shapes'
                  },
                  {
                    title: 'Realist Painting',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-12',
                    permalink: '/demos/css/css-art/realist-painting.html',
                    tags: ['css', 'art', 'painting'],
                    content: 'A lot of css'
                  }
                ]
              },
              {
                name: 'Grid',
                slug: 'grid',
                date: '2025-11-09',
                content: '',
                posts: [
                  {
                    title: 'Grid vs Flexbox',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-10',
                    permalink: '/demos/css/grid/grid-vs-flexbox',
                    tags: ['css', 'grid', 'flex', 'layout'],
                    content: 'A versus'
                  },
                  {
                    title: 'Hello Grid',
                    maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                    date: '2025-11-09',
                    permalink: '/demos/css/grid/hello-grid.html',
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
                permalink: '/demos/css/hello-css.html',
                tags: ['css', 'tutorial'],
                content: 'there is css'
              }
            ]
          },
          {
            name: 'Three.js',
            slug: 'threejs',
            title: 'Not one and not two, it\'s three',
            date: '2025-11-10',
            categoryContentType: 'Technique',
            categoryAlias: 'technique',
            categoriesAlias: 'techniques',
            content: '<h1 id="welcome-to-three-stuff">Welcome to three stuff</h1>',
            categories: [
              {
                name: 'Sprite',
                slug: 'sprite',
                date: '2025-11-11',
                content: '',
                posts: [
                  {
                    title: 'Minesweeper',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-10',
                    permalink: '/demos/threejs/sprite/minesweeper',
                    tags: ['game'],
                    content: 'A Classic'
                  },
                  {
                    title: 'Stickman',
                    maker: { title: 'Mustafa Enes', slug: 'enes' },
                    date: '2025-11-11',
                    permalink: '/demos/threejs/sprite/stickman.html',
                    tags: ['game'],
                    content: 'stickman demo'
                  }
                ]
              },
              {
                name: 'WebGPU',
                slug: 'webgpu',
                date: '2025-11-12',
                content: '',
                posts: [
                  {
                    title: 'Ipsum demo',
                    date: '2025-11-12',
                    permalink: '/demos/threejs/webgpu/ipsum-demo.html',
                    content: ''
                  },
                  {
                    title: 'Lorem Demo',
                    date: '2025-11-13',
                    permalink: '/demos/threejs/webgpu/lorem-demo',
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
                permalink: '/demos/threejs/intelligent-drum-n-bass',
                tags: ['reproduction', 'music', 'cars', 'visual effects'],
                content: 'Impala on the F ring'
              },
              {
                title: 'Simple 3D',
                maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                date: '2025-11-09',
                permalink: '/demos/threejs/simple-3d.html',
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
            permalink: '/demos/hello-world',
            tags: ['html', 'hello world'],
            content: '<h1>Hello world</h1>\n\n<p>Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>'
          },
          {
            title: 'good-morning-world',
            maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
            date: '2025-11-07',
            permalink: '/demos/good-morning-world.html',
            tags: ['html', 'attributes', 'good morning'],
            content: '<h1>Good morning world</h1>\n\n<p align="center">Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>'
          }
        ]
      },
      {
        name: 'events',
        date: '2025-11-13',
        entryContentType: 'Event',
        facets: ['lorem', 'ipsum', 'dolor'],
        content: '',
        categories: [],
        posts: [
          {
            title: 'Lets HTML now',
            date: '2025-11-13',
            permalink: '/events/lets-html-now.html',
            organizers: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
            participants: [{ title: 'Mustafa Enes', slug: 'enes' }],
            content: 'html good'
          },
          {
            title: 'Lets get together',
            date: '2025-11-13',
            permalink: '/events/lets-get-together.html',
            organizers: [
              { title: 'Mustafa Enes', slug: 'enes' },
              { title: 'Sir Tim Berners Lee', slug: 'tim' }
            ],
            content: 'And call it an event'
          },
          {
            title: 'ManU - CFC',
            date: '2025-11-13',
            permalink: '/events/manu-cfc.html',
            participants: [{ title: 'Sir Alex Ferguson', slug: 'alex' }],
            content: ''
          },
          {
            title: 'What to do',
            date: '2025-11-13',
            permalink: '/events/what-to-do.html',
            participants: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
            content: ''
          }
        ]
      }
    ],
    subpages: [
      {
        permalink: '/about-us.html',
        date: '2025-11-14',
        content: 'Something about us'
      },
      {
        permalink: '/newsletter.html',
        date: '2025-11-15',
        content: 'Sign up now'
      }
    ]
  }

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

  t.test('Verify homepage displays all discovered content', async t => {
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
      const collectionLinks = $('a').toArray().filter(link => {
        const href = $(link).attr('href')
        const text = $(link).text()
        return (
          text.toLowerCase() === collection.name &&
          href === `/${collection.name}`
        )
      })

      return collectionLinks.length !== 0
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

      const allUsedFacetsFound = Array.from(usedFacets).every(facet =>
        facetLinks.some(link => link.text === facet.toLowerCase())
      )

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
      const postTexts = $('a').toArray().map(link => $(link).text())

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
      'all collection posts from fixture are listed'
    )

    const pageHrefs = $('a').toArray()
      .map(link => $(link).attr('href'))
      .filter(href => href)

    const allSubpagesListed = FIXTURE_CONTENT_MODEL.subpages.every(subpage =>
      pageHrefs.includes(subpage.permalink)
    )

    t.ok(
      allSubpagesListed,
      'all subpages are listed in the homepage'
    )
  })

  t.test('Verify individual collection pages', async t => {

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

      const collectionNameLowercase = collection.name.toLowerCase()
      const hasValidTitle = $('a').toArray().some(link =>
        $(link).text().toLowerCase() === collectionNameLowercase
      )

      t.ok(
        hasValidTitle,
        `${collection.name} collection page has a link with collection name`
      )

      if (collection.content) {
        t.ok(
          collectionHtml.includes(collection.content),
          `${collection.name} collection index.html contains collection content`
        )
      }

      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      const facetTexts = $('a').toArray()
        .map(link => $(link).text().toLowerCase())

      const allUsedFacetsFound = Array.from(usedFacets).every(facet =>
        facetTexts.includes(facet.toLowerCase())
      )

      t.ok(
        allUsedFacetsFound,
        `${collection.name} displays all expected facets`
      )

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

      const allCollectionPosts = flattenPostsFromCategories(
        collection.categories,
        collection.posts
      )

      const allLinkTexts = $('a').toArray().map(link => $(link).text())

      const allPostsPresent = allCollectionPosts.every(post =>
        allLinkTexts.includes(post.title)
      )

      t.ok(
        allPostsPresent,
        `${collection.name} displays all posts`
      )

      if (collection.categories.length !== 0) {
        const topLevelCategoryTitles = collection.categories
          .map(c => c.title || c.name)
          .filter(title => title)

        const topLevelCategoryTitlesPresent = topLevelCategoryTitles.every(
          title => allLinkTexts.includes(title)
        )

        t.ok(
          topLevelCategoryTitlesPresent,
          `${collection.name} displays all top-level category titles`
        )

        const categoriesHavePosts = collection.categories.every(category => {
          const categoryPosts = flattenPostsFromCategories(
            category.categories,
            category.posts
          )
          return categoryPosts.length !== 0
        })

        t.ok(
          categoriesHavePosts,
          `${collection.name} all top-level categories have at least one post`
        )

        const topLevelCategoryPostsPresent = collection.categories.every(
          category => {
            const categoryPosts = category.posts || []
            return categoryPosts.every(post =>
              allLinkTexts.includes(post.title)
            ) || category.categories.some(subcat =>
              subcat.posts && subcat.posts.some(post =>
                allLinkTexts.includes(post.title)
              )
            )
          }
        )

        t.ok(
          topLevelCategoryPostsPresent,
          `${collection.name} displays posts from all top-level categories`
        )
      }
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

      const allLinkTexts = $('a').toArray().map(link => $(link).text())

      const allUsedFacetsListed = Array.from(usedFacets).every(facet =>
        allLinkTexts.includes(facet)
      )

      t.ok(
        allUsedFacetsListed,
        `${collection.name} /by page lists all used facets`
      )

      const facetCountsCorrect = Array.from(usedFacets).every(facet => {
        const facetCount = allLinkTexts.filter(name => name === facet).length
        return facetCount === 1
      })

      t.ok(
        facetCountsCorrect,
        `${collection.name} /by page lists each facet exactly once`
      )

      const expectedFacetValues = {}
      for (const facet of usedFacets) {
        expectedFacetValues[facet] = getExpectedFacetValues(
          facet,
          collection.categories,
          collection.posts
        )
      }

      const allExpectedValuesPresent = Array.from(usedFacets).every(facet => {
        const expectedValues = expectedFacetValues[facet]
        return Array.from(expectedValues).every(value => {
          const title = getFacetValueTitle(value)
          return allLinkTexts.includes(title)
        })
      })

      t.ok(
        allExpectedValuesPresent,
        `${collection.name} /by page displays all expected facet values`
      )

      const facetValuesAreUnique = Array.from(usedFacets).every(facet => {
        const expectedValues = expectedFacetValues[facet]
        return Array.from(expectedValues).every(value => {
          const title = getFacetValueTitle(value)
          const valueCount = allLinkTexts.filter(text => text === title).length
          return valueCount === 1
        })
      })

      t.ok(
        facetValuesAreUnique,
        `${collection.name} /by page displays each facet value exactly once`
      )

      const unusedFacets = collection.facets.filter(
        facet => !usedFacets.has(facet)
      )
      const noUnusedFacetsRendered = unusedFacets.every(facet =>
        !allLinkTexts.includes(facet)
      )

      t.ok(
        noUnusedFacetsRendered,
        `${collection.name} /by page does not display unused facets`
      )
    }
  })

  t.test('Verify facetName pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      if (usedFacets.size === 0) {
        continue
      }

      for (const facetName of usedFacets) {
        const facetNamePath = join(
          rootDirectory,
          exportDirectory,
          collection.name,
          FACET_BROWSE_PATH,
          facetName,
          'index.html'
        )

        const facetNameHtml = await readFile(
          facetNamePath,
          { encoding: 'utf-8' }
        )

        const $ = load(facetNameHtml)

        const expectedFacetValues = getExpectedFacetValues(
          facetName,
          collection.categories,
          collection.posts
        )

        const allLinkTexts = $('a').toArray().map(link => $(link).text())

        const allValuesPresent = Array.from(expectedFacetValues).every(
          expectedValue => {
            const title = getFacetValueTitle(expectedValue)
            return allLinkTexts.includes(title)
          }
        )

        t.ok(
          allValuesPresent,
          `${collection.name} /by/${facetName} lists all expected facet values`
        )

        const facetValuesAreUnique = Array.from(expectedFacetValues).every(
          expectedValue => {
            const title = getFacetValueTitle(expectedValue)
            const valueCount = allLinkTexts.filter(
              text => text === title
            ).length
            return valueCount === 1
          }
        )

        t.ok(
          facetValuesAreUnique,
          `${collection.name} /by/${facetName} lists each facet value exactly once`
        )

        const allCollectionPosts = flattenPostsFromCategories(
          collection.categories,
          collection.posts
        )

        const allCollectionPostTitles = allCollectionPosts.map(post => post.title)

        const allPostsHaveValidLinks = allCollectionPostTitles.every(postTitle => {
          const matchingLinks = $('a').toArray().filter(link =>
            $(link).text() === postTitle
          )

          return matchingLinks.every(link => {
            const href = $(link).attr('href')
            const matchingPost = allCollectionPosts.find(
              post => post.title === postTitle
            )

            if (!matchingPost) {
              return false
            }

            return href === matchingPost.permalink
          })
        })

        t.ok(
          allPostsHaveValidLinks,
          `${collection.name} /by/${facetName} posts have correct links`
        )
      }
    }
  })

  t.test('Verify facetValue pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      if (usedFacets.size === 0) {
        continue
      }

      const allCollectionPosts = flattenPostsFromCategories(
        collection.categories,
        collection.posts
      )

      for (const facetName of usedFacets) {
        const expectedFacetValues = getExpectedFacetValues(
          facetName,
          collection.categories,
          collection.posts
        )

        for (const facetValue of expectedFacetValues) {
          const facetValueSlug = getFacetValueSlug(facetValue)
          const facetValueTitle = getFacetValueTitle(facetValue)

          const facetValuePath = join(
            rootDirectory,
            exportDirectory,
            collection.name,
            FACET_BROWSE_PATH,
            facetName,
            facetValueSlug,
            'index.html'
          )

          const facetValueHtml = await readFile(
            facetValuePath,
            { encoding: 'utf-8' }
          )

          const $ = load(facetValueHtml)

          const postsWithFacetValue = allCollectionPosts.filter(post => {
            if (!post.hasOwnProperty(facetName)) {
              return false
            }

            const value = post[facetName]
            if (Array.isArray(value)) {
              return value.some(v => {
                const vTitle = getFacetValueTitle(v)
                return vTitle === facetValueTitle
              })
            } else {
              const vTitle = getFacetValueTitle(value)
              return vTitle === facetValueTitle
            }
          })

          const allLinkTexts = $('a').toArray().map(link => $(link).text())

          const allPostsPresent = postsWithFacetValue.every(post =>
            allLinkTexts.includes(post.title)
          )

          t.ok(
            allPostsPresent,
            `${collection.name} /by/${facetName}/${facetValueSlug} lists all posts with this facet value`
          )

          const allPostsHaveValidLinks = postsWithFacetValue.every(post => {
            const matchingLinks = $('a').toArray().filter(link =>
              $(link).text() === post.title
            )

            return matchingLinks.every(link => {
              const href = $(link).attr('href')
              return href === post.permalink
            })
          })

          t.ok(
            allPostsHaveValidLinks,
            `${collection.name} /by/${facetName}/${facetValueSlug} posts have correct links`
          )
        }
      }
    }
  })

  t.test('Verify no facet pages for collections with zero used facets', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      if (usedFacets.size !== 0) {
        continue
      }

      const facetBrowseDir = join(
        rootDirectory,
        exportDirectory,
        collection.name,
        FACET_BROWSE_PATH
      )

      try {
        await stat(facetBrowseDir)
        t.fail(
          `${collection.name} /by directory should not exist when no facets are used`
        )
      } catch (err) {
        if (err.code === 'ENOENT') {
          t.ok(
            true,
            `${collection.name} /by directory does not exist when no facets are used`
          )
        } else {
          t.fail(
            `${collection.name} /by check failed: ${err.message}`
          )
        }
      }
    }
  })

  t.test('Verify category facet browse pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      const processCategory = async (
        category,
        parentPath = ''
      ) => {
        const categoryPath = parentPath
          ? `${parentPath}/${category.slug}`
          : category.slug

        const categoryPosts = flattenCategoryPosts(category)

        const usedFacets = getUsedFacets(
          category.categories,
          category.posts,
          collection.facets
        )

        if (usedFacets.size !== 0) {
          const facetBrowsePath = join(
            rootDirectory,
            exportDirectory,
            collection.name,
            categoryPath,
            FACET_BROWSE_PATH,
            'index.html'
          )

          try {
            const facetBrowseHtml = await readFile(
              facetBrowsePath,
              { encoding: 'utf-8' }
            )

            const $ = load(facetBrowseHtml)
            const allLinkTexts = $('a').toArray().map(link => $(link).text())

            const allUsedFacetsListed = Array.from(usedFacets).every(facet =>
              allLinkTexts.includes(facet)
            )

            t.ok(
              allUsedFacetsListed,
              `${collection.name}/${categoryPath}/by page lists all used facets`
            )

            const facetCountsCorrect = Array.from(usedFacets).every(facet => {
              const facetCount = allLinkTexts.filter(name => name === facet).length
              return facetCount === 1
            })

            t.ok(
              facetCountsCorrect,
              `${collection.name}/${categoryPath}/by page lists each facet exactly once`
            )
          } catch (err) {
            t.fail(
              `${collection.name}/${categoryPath}/by page: ${err.message}`
            )
          }
        }

        if (Array.isArray(category.categories)) {
          for (const subCategory of category.categories) {
            await processCategory(subCategory, categoryPath)
          }
        }
      }

      for (const category of collection.categories) {
        await processCategory(category)
      }
    }
  })

  t.test('Verify category facetName pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      const processCategory = async (
        category,
        parentPath = ''
      ) => {
        const categoryPath = parentPath
          ? `${parentPath}/${category.slug}`
          : category.slug

        const categoryPosts = flattenCategoryPosts(category)

        const usedFacets = getUsedFacets(
          category.categories,
          category.posts,
          collection.facets
        )

        if (usedFacets.size !== 0) {
          for (const facetName of usedFacets) {
            const facetNamePath = join(
              rootDirectory,
              exportDirectory,
              collection.name,
              categoryPath,
              FACET_BROWSE_PATH,
              facetName,
              'index.html'
            )

            try {
              const facetNameHtml = await readFile(
                facetNamePath,
                { encoding: 'utf-8' }
              )

              const $ = load(facetNameHtml)
              const allLinkTexts = $('a').toArray().map(link => $(link).text())

              const expectedFacetValues = getExpectedFacetValues(
                facetName,
                category.categories,
                category.posts
              )

              const allValuesPresent = Array.from(expectedFacetValues).every(
                expectedValue => {
                  const title = getFacetValueTitle(expectedValue)
                  return allLinkTexts.includes(title)
                }
              )

              t.ok(
                allValuesPresent,
                `${collection.name}/${categoryPath}/by/${facetName} lists all expected facet values`
              )

              const facetValuesAreUnique = Array.from(expectedFacetValues).every(
                expectedValue => {
                  const title = getFacetValueTitle(expectedValue)
                  const valueCount = allLinkTexts.filter(
                    text => text === title
                  ).length
                  return valueCount === 1
                }
              )

              t.ok(
                facetValuesAreUnique,
                `${collection.name}/${categoryPath}/by/${facetName} lists each facet value exactly once`
              )
            } catch (err) {
              t.fail(
                `${collection.name}/${categoryPath}/by/${facetName} page: ${err.message}`
              )
            }
          }
        }

        if (Array.isArray(category.categories)) {
          for (const subCategory of category.categories) {
            await processCategory(subCategory, categoryPath)
          }
        }
      }

      for (const category of collection.categories) {
        await processCategory(category)
      }
    }
  })

  t.test('Verify category facetValue pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      const processCategory = async (
        category,
        parentPath = ''
      ) => {
        const categoryPath = parentPath
          ? `${parentPath}/${category.slug}`
          : category.slug

        const categoryPosts = flattenCategoryPosts(category)

        const usedFacets = getUsedFacets(
          category.categories,
          category.posts,
          collection.facets
        )

        if (usedFacets.size !== 0) {
          for (const facetName of usedFacets) {
            const expectedFacetValues = getExpectedFacetValues(
              facetName,
              category.categories,
              category.posts
            )

            for (const facetValue of expectedFacetValues) {
              const facetValueSlug = getFacetValueSlug(facetValue)
              const facetValueTitle = getFacetValueTitle(facetValue)

              const facetValuePath = join(
                rootDirectory,
                exportDirectory,
                collection.name,
                categoryPath,
                FACET_BROWSE_PATH,
                facetName,
                facetValueSlug,
                'index.html'
              )

              try {
                const facetValueHtml = await readFile(
                  facetValuePath,
                  { encoding: 'utf-8' }
                )

                const $ = load(facetValueHtml)

                const postsWithFacetValue = categoryPosts.filter(post => {
                  if (!post.hasOwnProperty(facetName)) {
                    return false
                  }

                  const value = post[facetName]
                  if (Array.isArray(value)) {
                    return value.some(v => {
                      const vTitle = getFacetValueTitle(v)
                      return vTitle === facetValueTitle
                    })
                  } else {
                    const vTitle = getFacetValueTitle(value)
                    return vTitle === facetValueTitle
                  }
                })

                const allLinkTexts = $('a').toArray().map(link => $(link).text())

                const allPostsPresent = postsWithFacetValue.every(post =>
                  allLinkTexts.includes(post.title)
                )

                t.ok(
                  allPostsPresent,
                  `${collection.name}/${categoryPath}/by/${facetName}/${facetValueSlug} lists all posts with this facet value`
                )

                const allPostsHaveValidLinks = postsWithFacetValue.every(post => {
                  const matchingLinks = $('a').toArray().filter(link =>
                    $(link).text() === post.title
                  )

                  return matchingLinks.every(link => {
                    const href = $(link).attr('href')
                    return href === post.permalink
                  })
                })

                t.ok(
                  allPostsHaveValidLinks,
                  `${collection.name}/${categoryPath}/by/${facetName}/${facetValueSlug} posts have correct links`
                )
              } catch (err) {
                t.fail(
                  `${collection.name}/${categoryPath}/by/${facetName}/${facetValueTitle} page: ${err.message}`
                )
              }
            }
          }
        }

        if (Array.isArray(category.categories)) {
          for (const subCategory of category.categories) {
            await processCategory(subCategory, categoryPath)
          }
        }
      }

      for (const category of collection.categories) {
        await processCategory(category)
      }
    }
  })

  t.test('Verify no category facet pages for categories with zero used facets', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      const processCategory = async (
        category,
        parentPath = ''
      ) => {
        const categoryPath = parentPath
          ? `${parentPath}/${category.slug}`
          : category.slug

        const usedFacets = getUsedFacets(
          category.categories,
          category.posts,
          collection.facets
        )

        if (usedFacets.size !== 0) {
          if (Array.isArray(category.categories)) {
            for (const subCategory of category.categories) {
              await processCategory(subCategory, categoryPath)
            }
          }
          return
        }

        const facetBrowseDir = join(
          rootDirectory,
          exportDirectory,
          collection.name,
          categoryPath,
          FACET_BROWSE_PATH
        )

        try {
          await stat(facetBrowseDir)
          t.fail(
            `${collection.name}/${categoryPath}/by directory should not exist when no facets are used`
          )
        } catch (err) {
          if (err.code === 'ENOENT') {
            t.ok(
              true,
              `${collection.name}/${categoryPath}/by directory does not exist when no facets are used`
            )
          } else {
            t.fail(
              `${collection.name}/${categoryPath}/by check failed: ${err.message}`
            )
          }
        }

        if (Array.isArray(category.categories)) {
          for (const subCategory of category.categories) {
            await processCategory(subCategory, categoryPath)
          }
        }
      }

      for (const category of collection.categories) {
        await processCategory(category)
      }
    }
  })

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
