/*
 * Category Page Tests
 *
 * Tests that verify category pages within collections:
 *   - Individual category pages display correctly
 *   - Facet browse pages are rendered correctly for categories
 *   - Facet name pages are rendered correctly for categories
 *   - Facet value pages are rendered correctly for categories
 *   - Facet pages are not created for categories with zero used facets
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
  getFacetValueTitle
} = require('./helpers')

const fixturesDirectory = join(__dirname, 'fixtures', 'fs')

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

/*
 * Recursively processes categories for facet-related testing.
 * Accepts a testLogic callback that defines what assertions to run.
 * This helper is only used by category tests.
 */
const processCategoryFacets = async (
  collection,
  category,
  testLogic,
  parentPath = ''
) => {
  const categoryPath = parentPath ?
    `${parentPath}/${category.slug}` :
    category.slug

  const usedFacets = getUsedFacets(
    category.categories,
    category.posts,
    collection.facets
  )

  await testLogic(collection, category, categoryPath, usedFacets)

  if (Array.isArray(category.categories)) {
    for (const subCategory of category.categories) {
      await processCategoryFacets(
        collection,
        subCategory,
        testLogic,
        categoryPath
      )
    }
  }
}

test('E2E Magazine - Category Pages', async t => {

  const testDir = join(tmpdir(), 'e2e-magazine-categories-build')
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

  t.test('Verify individual category pages', async t => {
    const processCategoryPages = async (
      collection,
      category,
      categoryPath,
      parentPath = ''
    ) => {
      const categoryIndexPath = join(
        rootDirectory,
        exportDirectory,
        collection.name,
        categoryPath,
        'index.html'
      )

      try {
        const categoryHtml = await readFile(
          categoryIndexPath,
          { encoding: 'utf-8' }
        )

        const $ = load(categoryHtml)

        const categoryTitle = category.title || category.name
        const hasCategoryTitle = $('a').toArray().some(link => {
          return $(link).text() === categoryTitle
        })

        t.ok(
          hasCategoryTitle,
          `${collection.name}/${categoryPath} displays category title`
        )

        if (category.content) {
          const bodyContent = $('body').html()
          const hasExactContent = bodyContent.includes(category.content)

          t.ok(
            hasExactContent,
            `${collection.name}/${categoryPath} contains category content`
          )
        }

        const usedFacets = getUsedFacets(
          category.categories,
          category.posts,
          collection.facets
        )

        const allLinks = $('a').toArray()

        if (usedFacets.size !== 0) {
          const browseFacetsHref = `/${collection.name}/${categoryPath}/${FACET_BROWSE_PATH}`
          const hasBrowseFacetsLink = allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === 'by' && linkHref === browseFacetsHref
          })

          t.ok(
            hasBrowseFacetsLink,
            `${collection.name}/${categoryPath} has browse facets link`
          )
        }

        const allUsedFacetsLinked = Array.from(usedFacets).every(facet => {
          const facetPageHref = `/${collection.name}/${categoryPath}/${FACET_BROWSE_PATH}/${facet}`
          return allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === facet && linkHref === facetPageHref
          })
        })

        t.ok(
          allUsedFacetsLinked,
          `${collection.name}/${categoryPath} displays all used facets with correct links`
        )

        const unusedFacets = collection.facets.filter(
          facet => !usedFacets.has(facet)
        )
        const noUnusedFacetsLinked = unusedFacets.every(facet => {
          const facetPageHref = `/${collection.name}/${categoryPath}/${FACET_BROWSE_PATH}/${facet}`
          return !allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === facet && linkHref === facetPageHref
          })
        })

        t.ok(
          noUnusedFacetsLinked,
          `${collection.name}/${categoryPath} does not display unused facets`
        )

        const categoryPosts = flattenCategoryPosts(category)

        const allPostsLinked = categoryPosts.every(post => {
          return allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === post.title && linkHref === post.permalink
          })
        })

        t.ok(
          allPostsLinked,
          `${collection.name}/${categoryPath} displays all posts with correct links`
        )

        const allLinkTexts = allLinks.map(link => $(link).text())

        if (Array.isArray(category.categories) && category.categories.length !== 0) {
          const directSubcategoryTitles = category.categories
            .map(c => c.title || c.name)
            .filter(title => title)

          const directSubcategoriesPresent = directSubcategoryTitles.every(
            title => allLinkTexts.includes(title)
          )

          t.ok(
            directSubcategoriesPresent,
            `${collection.name}/${categoryPath} displays all direct subcategories`
          )

          const subcategoriesHavePosts = category.categories.every(
            subcat => {
              const subcatPosts = flattenCategoryPosts(subcat)
              return subcatPosts.length !== 0
            }
          )

          t.ok(
            subcategoriesHavePosts,
            `${collection.name}/${categoryPath} all direct subcategories have at least one post`
          )

          const allSubcategoriesHaveValidLinks = category.categories.every(
            subcat => {
              const subcategoryHref = `/${collection.name}/${categoryPath}/${subcat.slug}`
              const subcategoryTitle = subcat.title || subcat.name
              return allLinks.some(link => {
                const linkText = $(link).text()
                const linkHref = $(link).attr('href')
                return linkText === subcategoryTitle && linkHref === subcategoryHref
              })
            }
          )

          t.ok(
            allSubcategoriesHaveValidLinks,
            `${collection.name}/${categoryPath} displays subcategories with correct links`
          )
        }
      } catch (err) {
        t.fail(
          `${collection.name}/${categoryPath} index.html: ${err.message}`
        )
      }

      if (Array.isArray(category.categories)) {
        for (const subCategory of category.categories) {
          const subcategoryPath = `${categoryPath}/${subCategory.slug}`
          await processCategoryPages(
            collection,
            subCategory,
            subcategoryPath,
            categoryPath
          )
        }
      }
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryPages(collection, category, category.slug)
      }
    }
  })

  t.test('Verify category facet browse pages', async t => {
    const testBrowsePage = async (collection, category, categoryPath, usedFacets) => {
      if (usedFacets.size === 0) {
        return
      }

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
        const allLinks = $('a').toArray()

        const allUsedFacetsListed = Array.from(usedFacets).every(facet => {
          const facetPageHref = `/${collection.name}/${categoryPath}/${FACET_BROWSE_PATH}/${facet}`
          return allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === facet && linkHref === facetPageHref
          })
        })

        t.ok(
          allUsedFacetsListed,
          `${collection.name}/${categoryPath}/by page lists all used facets`
        )

        const facetCountsCorrect = Array.from(usedFacets).every(facet => {
          const facetPageHref = `/${collection.name}/${categoryPath}/${FACET_BROWSE_PATH}/${facet}`
          const facetCount = allLinks.filter(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === facet && linkHref === facetPageHref
          }).length
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

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testBrowsePage)
      }
    }
  })

  t.test('Verify category facetName pages', async t => {
    const testFacetNamePage = async (collection, category, categoryPath, usedFacets) => {
      if (usedFacets.size === 0) {
        return
      }

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
          const allLinks = $('a').toArray()

          const expectedFacetValues = getExpectedFacetValues(
            facetName,
            category.categories,
            category.posts
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

          t.ok(
            allValuesPresent,
            `${collection.name}/${categoryPath}/by/${facetName} lists all expected facet values`
          )

          const facetValuesAreUnique = Array.from(expectedFacetValues).every(
            expectedValue => {
              const facetValueSlug = getFacetValueSlug(expectedValue)
              const valueCount = allLinks.filter(link => {
                const linkHref = $(link).attr('href')
                return linkHref === facetValueSlug
              }).length
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

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testFacetNamePage)
      }
    }
  })

  t.test('Verify category facetValue pages', async t => {
    const testFacetValuePage = async (collection, category, categoryPath, usedFacets) => {
      if (usedFacets.size === 0) {
        return
      }

      const categoryPosts = flattenCategoryPosts(category)

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
            const allLinks = $('a').toArray()

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

            const allPostsPresent = postsWithFacetValue.every(post => {
              return allLinks.some(link => {
                const linkText = $(link).text()
                const linkHref = $(link).attr('href')
                return linkText === post.title && linkHref === post.permalink
              })
            })

            t.ok(
              allPostsPresent,
              `${collection.name}/${categoryPath}/by/${facetName}/${facetValueSlug} lists all posts with this facet value`
            )

            const allPostsHaveValidLinks = postsWithFacetValue.every(post => {
              return allLinks.some(link => {
                const linkText = $(link).text()
                const linkHref = $(link).attr('href')
                return linkText === post.title && linkHref === post.permalink
              })
            })

            t.ok(
              allPostsHaveValidLinks,
              `${collection.name}/${categoryPath}/by/${facetName}/${facetValueSlug} posts have correct links`
            )
          } catch (err) {
            t.fail(
              `${collection.name}/${categoryPath}/by/${facetName}/${facetValueSlug} page: ${err.message}`
            )
          }
        }
      }
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testFacetValuePage)
      }
    }
  })

  t.test('Verify no category facet pages for categories with zero used facets', async t => {
    const testNoFacetPages = async (collection, category, categoryPath, usedFacets) => {
      if (usedFacets.size !== 0) {
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
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || collection.categories.length === 0) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testNoFacetPages)
      }
    }
  })

  t.teardown(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})