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
      const hasValidTitle = $('a').toArray().some(link => {
        return $(link).text().toLowerCase() === collectionNameLowercase
      })

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

      const allLinks = $('a').toArray()

      if (usedFacets.size !== 0) {
        const browseFacetsHref = `/${collection.name}/${FACET_BROWSE_PATH}`
        const hasBrowseFacetsLink = allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === 'by' && linkHref === browseFacetsHref
        })

        t.ok(
          hasBrowseFacetsLink,
          `${collection.name} has browse facets link`
        )
      }

      const allUsedFacetsLinked = Array.from(usedFacets).every(facet => {
        const facetPageHref = `/${collection.name}/${FACET_BROWSE_PATH}/${facet}`
        return allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetPageHref
        })
      })

      t.ok(
        allUsedFacetsLinked,
        `${collection.name} displays all expected facets with correct links`
      )

      const unusedFacets = collection.facets.filter(
        facet => !usedFacets.has(facet)
      )
      const noUnusedFacetsLinked = unusedFacets.every(facet => {
        const facetPageHref = `/${collection.name}/${FACET_BROWSE_PATH}/${facet}`
        return !allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetPageHref
        })
      })

      t.ok(
        noUnusedFacetsLinked,
        `${collection.name} does not display unused facets`
      )

      const allCollectionPosts = flattenPostsFromCategories(
        collection.categories,
        collection.posts
      )

      const allPostsLinked = allCollectionPosts.every(post => {
        return allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === post.title && linkHref === post.permalink
        })
      })

      t.ok(
        allPostsLinked,
        `${collection.name} displays all posts with correct links`
      )

      const allLinkTexts = allLinks.map(link => $(link).text())

      if (collection.categories.length !== 0) {
        const topLevelCategoryTitles = collection.categories
          .map(c => c.title)
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

        const allCategoriesHaveValidLinks = collection.categories.every(
          category => {
            const categoryHref = `/${collection.name}/${category.slug}`
            return allLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === category.title && linkHref === categoryHref
            })
          }
        )

        t.ok(
          allCategoriesHaveValidLinks,
          `${collection.name} displays categories with correct links`
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
      const allLinks = $('a').toArray()
      const allLinkTexts = allLinks.map(link => $(link).text())

      const allUsedFacetsListed = Array.from(usedFacets).every(facet => {
        const facetPageHref = `/${collection.name}/${FACET_BROWSE_PATH}/${facet}`
        return allLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetPageHref
        })
      })

      t.ok(
        allUsedFacetsListed,
        `${collection.name} /by page lists all used facets`
      )

      const facetCountsCorrect = Array.from(usedFacets).every(facet => {
        const facetPageHref = `/${collection.name}/${FACET_BROWSE_PATH}/${facet}`
        const facetCount = allLinks.filter(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref === facetPageHref
        }).length
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

        if (!allValuesPresent) {
          console.log(`

          * * * *

           - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          | All expected facet values not found in facet name page. |
           - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

          `)
          console.log(`
          Expected values:
          `)
          console.log(Array.from(expectedFacetValues))
          console.log(`


          All links found:
          `)
          console.log(allLinks)
          console.log(`

          * * * *

          `)
        }

        t.ok(
          allValuesPresent,
          `${collection.name} /by/${facetName} lists all expected facet values`
        )

        const facetValuesAreUnique = Array.from(expectedFacetValues).every(
          expectedValue => {
            const facetValueSlug = getFacetValueSlug(expectedValue)
            const matchingFacetValueLinks = allLinks.filter(link => {
              const linkHref = $(link).attr('href')
              return linkHref === facetValueSlug
            })
            if (matchingFacetValueLinks.length !== 1) {
              console.log(`

              * * *

              matchingFacetValueLinks

              * * *
              `)
              console.log(matchingFacetValueLinks)
              console.log(`

              * * *

              allLinks

              * * *
              `)
              console.log(allLinks)
            }
            return matchingFacetValueLinks.length === 1
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

          if (!allPostsPresent) {
            console.log(`

            * * * *

             - - - - - - - - - - - - - - - - - - - - - - - - - -
            | All expected posts not found in facet value page. |
             - - - - - - - - - - - - - - - - - - - - - - - - - -

            `)
            console.log(`
            Expected values:
            `)
            console.log(postsWithFacetValue.map(({ title, permalink }) => ({ title, permalink })))
            console.log(`


            All links found:
            `)
            console.log(allLinks)
            console.log(`

            * * * *

            `)
          }

          t.ok(
            allPostsPresent,
            `${collection.name} /by/${facetName}/${facetValueSlug} lists all posts with this facet value`
          )

          const allPostsHaveValidLinks = postsWithFacetValue.every(post => {
            return allLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === post.title && linkHref === post.permalink
            })
          })

          if (!allPostsHaveValidLinks) {
            console.log(`

            * * * *

             - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            | All posts don't have valid links in facet value page. |
             - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            `)
            console.log(`
            Expected posts:
            `)
            console.log(postsWithFacetValue.map(({ title, permalink }) => ({ title, permalink })))
            console.log(`


            All links found:
            `)
            console.log(allLinks)
            console.log(`

            * * * *

            `)
          }

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

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
