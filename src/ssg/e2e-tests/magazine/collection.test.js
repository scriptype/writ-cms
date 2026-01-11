/*
 * Collection Page Tests
 *
 * Tests that verify collection pages:
 *   - Each collection page has a valid title
 *   - Facets are displayed correctly on collection pages
 *   - Posts are organized by categories (with category headings)
 *   - All posts section displays complete post list
 *   - Facet browse pages are rendered correctly
 */

const { tmpdir } = require('os')
const { join } = require('path')
const { mkdir, rm, readFile, cp, stat } = require('fs/promises')
const test = require('tape')
const { load } = require('cheerio')
const writ = require('../..')
const { FIXTURE_CONTENT_MODEL } = require('./fixtures/model')
const {
  FACET_BROWSE_PATH,
  getUsedFacets,
  getExpectedFacetValues,
  getFacetValueSlug,
  getFacetValueTitle,
  flattenPostsFromCategories
} = require('./helpers')

const fixturesDirectory = join(__dirname, 'fixtures', 'fs')

test('E2E Magazine - Collection Pages', async t => {

  const testDir = join(tmpdir(), 'e2e-magazine-collections-build')
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

  t.test('Verify individual collection pages', async t => {
    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      const collectionIndexPath = join(
        rootDirectory,
        exportDirectory,
        collection.slug,
        'index.html'
      )

      let $
      try {
        const collectionHtml = await readFile(
          collectionIndexPath,
          { encoding: 'utf-8' }
        )
        $ = load(collectionHtml)
      } catch (err) {
        t.fail(
          `${collection.slug} collection index.html: ${err.message}`
        )
        continue
      }

      const siteTitle = $('[data-site-title]').text()
      t.equal(
        siteTitle,
        'Web Magazine',
        `${collection.slug} has correct site title`
      )

      const titleLink = $('[data-title]')
      t.equal(
        titleLink.text(),
        collection.title,
        `${collection.slug} displays collection title`
      )

      t.equal(
        titleLink.attr('href'),
        collection.permalink || `/${collection.slug}`,
        `${collection.slug} title link has correct href`
      )

      if (collection.content) {
        const contentElement = $('[data-content]')
        t.ok(
          contentElement.html().includes(collection.content),
          `${collection.slug} contains collection content`
        )
      }

      if (collection.collectionAlias === 'blog') {
        const templateText = $('[data-template-text]').text()
        t.equal(
          templateText,
          'Welcome to the blog template!',
          `${collection.slug} renders blog template text`
        )

        const blogTitle = $('[data-blog-title]').text()
        t.equal(
          blogTitle,
          collection.title,
          `${collection.slug} blog.title is correct`
        )

        const blogCategoriesLength = $('[data-blog-categories-length]').text()
        t.equal(
          parseInt(blogCategoriesLength),
          collection.categories.length,
          `${collection.slug} blog.categories.length is correct`
        )

        const collectionTitle = $('[data-collection-title]').text()
        t.equal(
          collectionTitle,
          collection.title,
          `${collection.slug} collection.title is correct`
        )

        const collectionCategoriesLength = $('[data-collection-categories-length]').text()
        t.equal(
          parseInt(collectionCategoriesLength),
          collection.categories.length,
          `${collection.slug} collection.categories.length is correct`
        )

        const blogTopicsLength = $('[data-blog-topics-length]').text()
        t.equal(
          parseInt(blogTopicsLength),
          collection.categories.length,
          `${collection.slug} blog.topics.length is correct`
        )

        const allBlogArticles = flattenPostsFromCategories(
          collection.categories,
          collection.posts
        )

        const blogPostsLength = $('[data-blog-posts-length]').text()
        t.equal(
          parseInt(blogPostsLength),
          allBlogArticles.length,
          `${collection.slug} blog.posts.length is correct`
        )
        const blogArticlesLength = $('[data-blog-articles-length]').text()
        t.equal(
          parseInt(blogArticlesLength),
          allBlogArticles.length,
          `${collection.slug} blog.articles.length is correct`
        )

        const collectionTopicsLength = $('[data-collection-topics-length]').text()
        t.equal(
          parseInt(collectionTopicsLength),
          collection.categories.length,
          `${collection.slug} collection.topics.length is correct`
        )

        const collectionPostsLength = $('[data-collection-posts-length]').text()
        t.equal(
          parseInt(collectionPostsLength),
          allBlogArticles.length,
          `${collection.slug} collection.posts.length is correct`
        )

        const collectionArticlesLength = $('[data-collection-articles-length]').text()
        t.equal(
          parseInt(collectionArticlesLength),
          allBlogArticles.length,
          `${collection.slug} collection.articles.length is correct`
        )
      }

      const usedFacets = getUsedFacets(
        collection.categories,
        collection.posts,
        collection.facets
      )

      if (usedFacets.size) {
        const facetBrowseLink = $('[data-facet-browse-link]')
        t.true(
          facetBrowseLink.length,
          `${collection.slug} has browse facets link`
        )
      }

      const facetNameLinks = $('[data-facet-name-link]').toArray()
      const allUsedFacetsLinked = Array.from(usedFacets).every(facet => {
        const facetHref = `/${collection.slug}/${FACET_BROWSE_PATH}/${facet}`
        return facetNameLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetHref
        })
      })

      t.true(
        allUsedFacetsLinked,
        `${collection.slug} displays all used facets with correct links`
      )

      const unusedFacets = collection.facets.filter(facet => !usedFacets.has(facet))
      const noUnusedFacetsLinked = unusedFacets.every(facet => {
        const facetHref = `/${collection.slug}/${FACET_BROWSE_PATH}/${facet}`
        return !facetNameLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetHref
        })
      })

      t.true(
        noUnusedFacetsLinked,
        `${collection.slug} does not display unused facets`
      )

      const allCollectionPosts = flattenPostsFromCategories(
        collection.categories,
        collection.posts
      )

      const postLinks = $('[data-post-link]').toArray()
      const allPostsLinked = allCollectionPosts.every(post => {
        return postLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === post.title && linkHref === post.permalink
        })
      })

      t.true(
        allPostsLinked,
        `${collection.slug} displays all posts with correct links`
      )

      if (collection.categories.length) {
        const categoryLinks = $('[data-category-link]').toArray()

        const namedCategories = collection.categories.filter(c => c.title)

        const allCategoriesLinked = namedCategories.every(category => {
          const categoryHref = `/${collection.slug}/${category.slug}`
          return categoryLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === category.title && linkHref === categoryHref
          })
        })

        t.true(
          allCategoriesLinked,
          `${collection.slug} displays all top-level categories with correct links`
        )

        const topLevelCategoryPostsPresent = namedCategories.every(category => {
          return category.posts.every(post => {
            return postLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === post.title && linkHref === post.permalink
            })
          })
        })

        t.true(
          topLevelCategoryPostsPresent,
          `${collection.slug} displays all top-level category posts with correct links`
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

      if (!usedFacets.size) {
        continue
      }

      const facetBrowsePath = join(
        rootDirectory,
        exportDirectory,
        collection.slug,
        FACET_BROWSE_PATH,
        'index.html'
      )

      let $
      try {
        const facetBrowseHtml = await readFile(
          facetBrowsePath,
          { encoding: 'utf-8' }
        )
        $ = load(facetBrowseHtml)
      } catch (err) {
        t.fail(
          `${collection.slug} /by page: ${err.message}`
        )
        continue
      }

      const allLinks = $('a').toArray()
      const allLinkTexts = allLinks.map(link => $(link).text())

      const allUsedFacetsListed = Array.from(usedFacets).every(facet => {
        const facetPageHref = `/${collection.slug}/${FACET_BROWSE_PATH}/${facet}`
        return allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetPageHref
        })
      })

      t.true(
        allUsedFacetsListed,
        `${collection.slug} /by page lists all used facets`
      )

      const facetCountsCorrect = Array.from(usedFacets).every(facet => {
        const facetPageHref = `/${collection.slug}/${FACET_BROWSE_PATH}/${facet}`
        const facetCount = allLinks.filter(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetPageHref
        }).length
        return facetCount === 1
      })

      t.true(
        facetCountsCorrect,
        `${collection.slug} /by page lists each facet exactly once`
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

      t.true(
        allExpectedValuesPresent,
        `${collection.slug} /by page displays all expected facet values`
      )

      const facetValuesAreUnique = Array.from(usedFacets).every(facet => {
        const expectedValues = expectedFacetValues[facet]
        return Array.from(expectedValues).every(value => {
          const title = getFacetValueTitle(value)
          const valueCount = allLinkTexts.filter(text => text === title).length
          return valueCount === 1
        })
      })

      t.true(
        facetValuesAreUnique,
        `${collection.slug} /by page displays each facet value exactly once`
      )

      const unusedFacets = collection.facets.filter(
        facet => !usedFacets.has(facet)
      )
      const noUnusedFacetsRendered = unusedFacets.every(facet =>
        !allLinkTexts.includes(facet)
      )

      t.true(
        noUnusedFacetsRendered,
        `${collection.slug} /by page does not display unused facets`
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

      if (!usedFacets.size) {
        continue
      }

      for (const facetName of usedFacets) {
        const facetNamePath = join(
          rootDirectory,
          exportDirectory,
          collection.slug,
          FACET_BROWSE_PATH,
          facetName,
          'index.html'
        )

        let $
        try {
          const facetNameHtml = await readFile(
            facetNamePath,
            { encoding: 'utf-8' }
          )
          $ = load(facetNameHtml)
        } catch (err) {
          t.fail(
            `${collection.slug} /by/${facetName} page: ${err.message}`
          )
          continue
        }

        const allLinks = $('a').toArray()

        const expectedFacetValues = getExpectedFacetValues(
          facetName,
          collection.categories,
          collection.posts
        )

        const allValuesPresent = Array.from(expectedFacetValues).every(
          expectedValue => {
            const facetValueSlug = getFacetValueSlug(expectedValue)
            return allLinks.some(link => {
              const linkHref = $(link).attr('href')
              return linkHref === facetValueSlug
            })
          }
        )

        t.true(
          allValuesPresent,
          `${collection.slug} /by/${facetName} lists all expected facet values`
        )

        const facetValuesAreUnique = Array.from(expectedFacetValues).every(
          expectedValue => {
            const facetValueSlug = getFacetValueSlug(expectedValue)
            const matchingFacetValueLinks = allLinks.filter(link => {
              const linkHref = $(link).attr('href')
              return linkHref === facetValueSlug
            })
            return matchingFacetValueLinks.length === 1
          }
        )

        t.true(
          facetValuesAreUnique,
          `${collection.slug} /by/${facetName} lists each facet value exactly once`
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

        t.true(
          allPostsHaveValidLinks,
          `${collection.slug} /by/${facetName} posts have correct links`
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

      if (!usedFacets.size) {
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
            collection.slug,
            FACET_BROWSE_PATH,
            facetName,
            facetValueSlug,
            'index.html'
          )

          let $
          try {
            const facetValueHtml = await readFile(
              facetValuePath,
              { encoding: 'utf-8' }
            )
            $ = load(facetValueHtml)
          } catch (err) {
            t.fail(
              `${collection.slug} /by/${facetName}/${facetValueSlug} page: ${err.message}`
            )
            continue
          }

          const allLinks = $('a').toArray()

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

          const allPostsPresent = postsWithFacetValue.every(post => {
            return allLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === post.title && linkHref === post.permalink
            })
          })

          t.true(
            allPostsPresent,
            `${collection.slug} /by/${facetName}/${facetValueSlug} lists all posts with this facet value`
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

      if (usedFacets.size) {
        continue
      }

      const facetBrowseDir = join(
        rootDirectory,
        exportDirectory,
        collection.slug,
        FACET_BROWSE_PATH
      )

      try {
        await stat(facetBrowseDir)
        t.fail(
          `${collection.slug} /by directory should not exist when no facets are used`
        )
      } catch (err) {
        if (err.code === 'ENOENT') {
          t.pass(
            `${collection.slug} /by directory does not exist when no facets are used`
          )
        } else {
          t.fail(
            `${collection.slug} /by check failed: ${err.message}`
          )
        }
      }
    }
  })

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
