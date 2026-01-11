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
      if (category.isDefaultCategory) {
        return
      }

      const categoryIndexPath = join(
        rootDirectory,
        exportDirectory,
        collection.slug,
        categoryPath,
        'index.html'
      )

      let $
      try {
        const categoryHtml = await readFile(
          categoryIndexPath,
          { encoding: 'utf-8' }
        )

        $ = load(categoryHtml)
      } catch (err) {
        t.fail(
          `${collection.slug}/${categoryPath} index.html: ${err.message}`
        )
        return
      }

      const siteTitle = $('[data-site-title]').text()
      t.equal(
        siteTitle,
        'Web Magazine',
        `${collection.slug}/${categoryPath} has correct site title`
      )

      const titleLink = $('[data-title]')
      t.equal(
        titleLink.text(),
        category.title,
        `${collection.slug}/${categoryPath} displays category title`
      )

      if (category.content) {
        const contentElement = $('[data-content]')
        t.ok(
          contentElement.html().includes(category.content),
          `${collection.slug}/${categoryPath} contains category content`
        )
      }

      const usedFacets = getUsedFacets(
        category.categories,
        category.posts,
        collection.facets
      )

      const facetBrowseLink = $('[data-facet-browse-link]')
      const facetLinks = $('[data-facet-link]').toArray()
      const postLinks = $('[data-post-link]').toArray()
      const categoryLinks = $('[data-category-link]').toArray()

      if (usedFacets.size) {
        t.ok(
          facetBrowseLink.length,
          `${collection.slug}/${categoryPath} has browse facets link`
        )
      }

      const allUsedFacetsLinked = Array.from(usedFacets).every(facet => {
        return facetLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref.includes(`/${facet}`)
        })
      })

      t.ok(
        allUsedFacetsLinked,
        `${collection.slug}/${categoryPath} displays all used facets with correct links`
      )

      const unusedFacets = collection.facets.filter(
        facet => !usedFacets.has(facet)
      )
      const noUnusedFacetsLinked = unusedFacets.every(facet => {
        return !facetLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === facet && linkHref.includes(`/${facet}`)
        })
      })

      t.ok(
        noUnusedFacetsLinked,
        `${collection.slug}/${categoryPath} does not display unused facets`
      )

      const categoryPosts = flattenCategoryPosts(category)

      const allPostsLinked = categoryPosts.every(post => {
        return postLinks.some(link => {
          const linkText = $(link).text()
          const linkHref = $(link).attr('href')
          return linkText === post.title && linkHref === post.permalink
        })
      })

      t.ok(
        allPostsLinked,
        `${collection.slug}/${categoryPath} displays all posts with correct links`
      )

      if (category.categories.length) {
        const directSubcategoriesPresent = category.categories.every(
          subcat => {
            const subcategoryHref = `/${collection.slug}/${categoryPath}/${subcat.slug}`
            return categoryLinks.some(link => {
              const linkText = $(link).text()
              const linkHref = $(link).attr('href')
              return linkText === subcat.title && linkHref === subcategoryHref
            })
          }
        )

        t.ok(
          directSubcategoriesPresent,
          `${collection.slug}/${categoryPath} displays all direct subcategories with correct links`
        )

        const allSubcategoryPostsDisplayed = category.categories.every(
          subcat => {
            const subcatPosts = flattenCategoryPosts(subcat)
            return subcatPosts.every(post => {
              return postLinks.some(link => {
                const linkText = $(link).text()
                const linkHref = $(link).attr('href')
                return linkText === post.title && linkHref === post.permalink
              })
            })
          }
        )

        t.ok(
          allSubcategoryPostsDisplayed,
          `${collection.slug}/${categoryPath} displays all posts from direct subcategories`
        )
      }

      if (category.contentType === 'Technology') {
        t.equal(
          $('[data-template-text]').text(),
          'Welcome to technology template!',
          `${collection.slug}/${categoryPath} renders technology template`
        )

        const technologyTitle = $('[data-technology-title]').text()
        t.equal(
          technologyTitle,
          category.title,
          `technology.title works`
        )

        const technologyCategoriesLength = parseInt($('[data-technology-categories-length]').text())
        t.equal(
          technologyCategoriesLength,
          category.categories.length,
          `technology.categories.length is correct`
        )

        const technologyTechniquesLength = parseInt($('[data-technology-techniques-length]').text())
        t.equal(
          technologyTechniquesLength,
          category.categories.length,
          `technology.techniques.length is correct`
        )

        const technologyPostsLength = parseInt($('[data-technology-posts-length]').text())
        t.equal(
          technologyPostsLength,
          categoryPosts.length,
          `technology.posts.length is correct`
        )

        const technologyDemosLength = parseInt($('[data-technology-demos-length]').text())
        t.equal(
          technologyDemosLength,
          categoryPosts.length,
          `technology.demos.length is correct`
        )

        const categoryTitle = $('[data-category-title]').text()
        t.equal(
          categoryTitle,
          technologyTitle,
          `category.title works`
        )

        const categoryCategoriesLength = parseInt($('[data-category-categories-length]').text())
        t.equal(
          categoryCategoriesLength,
          technologyCategoriesLength,
          `category.categories.length is correct`
        )

        const categoryTechniquesLength = parseInt($('[data-category-techniques-length]').text())
        t.equal(
          categoryTechniquesLength,
          technologyTechniquesLength,
          `category.techniques.length is correct`
        )

        const categoryPostsLength = parseInt($('[data-category-posts-length]').text())
        t.equal(
          categoryPostsLength,
          technologyPostsLength,
          `category.posts.length is correct`
        )

        const categoryDemosLength = parseInt($('[data-category-demos-length]').text())
        t.equal(
          categoryDemosLength,
          technologyDemosLength,
          `category.demos.length is correct`
        )
      }

      if (category.contentType === 'Technique') {
        t.equal(
          $('[data-template-text]').text(),
          'Welcome to technique template!',
          `${collection.slug}/${categoryPath} renders technique template`
        )

        const techniqueTitle = $('[data-technique-title]').text()
        t.equal(
          techniqueTitle,
          category.title,
          `technique.title works`
        )

        const techniqueCategoriesLength = parseInt($('[data-technique-categories-length]').text())
        t.equal(
          techniqueCategoriesLength,
          category.categories.length,
          `technique.categories.length is correct`
        )

        const techniqueTechniquesLength = parseInt($('[data-technique-techniques-length]').text())
        t.equal(
          techniqueTechniquesLength,
          category.categories.length,
          `technique.techniques.length is correct`
        )

        const techniquePostsLength = parseInt($('[data-technique-posts-length]').text())
        t.equal(
          techniquePostsLength,
          categoryPosts.length,
          `technique.posts.length is correct`
        )

        const techniqueDemosLength = parseInt($('[data-technique-demos-length]').text())
        t.equal(
          techniqueDemosLength,
          categoryPosts.length,
          `technique.demos.length is correct`
        )

        const categoryTitle = $('[data-category-title]').text()
        t.equal(
          categoryTitle,
          techniqueTitle,
          `category.title works`
        )

        const categoryCategoriesLength = parseInt($('[data-category-categories-length]').text())
        t.equal(
          categoryCategoriesLength,
          techniqueCategoriesLength,
          `category.categories.length is correct`
        )

        const categoryTechniquesLength = parseInt($('[data-category-techniques-length]').text())
        t.equal(
          categoryTechniquesLength,
          techniqueTechniquesLength,
          `category.techniques.length is correct`
        )

        const categoryPostsLength = parseInt($('[data-category-posts-length]').text())
        t.equal(
          categoryPostsLength,
          techniquePostsLength,
          `category.posts.length is correct`
        )

        const categoryDemosLength = parseInt($('[data-category-demos-length]').text())
        t.equal(
          categoryDemosLength,
          techniqueDemosLength,
          `category.demos.length is correct`
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
      if (!collection.categories || !collection.categories.length) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryPages(collection, category, category.slug)
      }
    }
  })

  t.test('Verify category facet browse pages', async t => {
    const testBrowsePage = async (collection, category, categoryPath, usedFacets) => {
      if (category.isDefaultCategory || !usedFacets.size) {
        return
      }

      const facetBrowsePath = join(
        rootDirectory,
        exportDirectory,
        collection.slug,
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
          const facetPageHref = `/${collection.slug}/${categoryPath}/${FACET_BROWSE_PATH}/${facet}`
          return allLinks.some(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === facet && linkHref === facetPageHref
          })
        })

        t.ok(
          allUsedFacetsListed,
          `${collection.slug}/${categoryPath}/by lists all used facets`
        )

        const facetCountsCorrect = Array.from(usedFacets).every(facet => {
          const facetPageHref = `/${collection.slug}/${categoryPath}/${FACET_BROWSE_PATH}/${facet}`
          const facetCount = allLinks.filter(link => {
            const linkText = $(link).text()
            const linkHref = $(link).attr('href')
            return linkText === facet && linkHref === facetPageHref
          }).length
          return facetCount === 1
        })

        t.ok(
          facetCountsCorrect,
          `${collection.slug}/${categoryPath}/by lists each facet exactly once`
        )
      } catch (err) {
        t.fail(
          `${collection.slug}/${categoryPath}/by page: ${err.message}`
        )
      }
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || !collection.categories.length) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testBrowsePage)
      }
    }
  })

  t.test('Verify category facetName pages', async t => {
    const testFacetNamePage = async (collection, category, categoryPath, usedFacets) => {
      if (category.isDefaultCategory || !usedFacets.size) {
        return
      }

      for (const facetName of usedFacets) {
        const facetNamePath = join(
          rootDirectory,
          exportDirectory,
          collection.slug,
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
            `${collection.slug}/${categoryPath}/by/${facetName} lists all expected facet values`
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
            `${collection.slug}/${categoryPath}/by/${facetName} lists each facet value exactly once`
          )
        } catch (err) {
          t.fail(
            `${collection.slug}/${categoryPath}/by/${facetName} page: ${err.message}`
          )
        }
      }
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || !collection.categories.length) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testFacetNamePage)
      }
    }
  })

  t.test('Verify category facetValue pages', async t => {
    const testFacetValuePage = async (collection, category, categoryPath, usedFacets) => {
      if (category.isDefaultCategory || !usedFacets.size) {
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
            collection.slug,
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
              `${collection.slug}/${categoryPath}/by/${facetName}/${facetValueSlug} lists all posts with this facet value`
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
              `${collection.slug}/${categoryPath}/by/${facetName}/${facetValueSlug} posts have correct links`
            )
          } catch (err) {
            t.fail(
              `${collection.slug}/${categoryPath}/by/${facetName}/${facetValueSlug} page: ${err.message}`
            )
          }
        }
      }
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || !collection.categories.length) {
        continue
      }

      for (const category of collection.categories) {
        await processCategoryFacets(collection, category, testFacetValuePage)
      }
    }
  })

  t.test('Verify no category facet pages for categories with zero used facets', async t => {
    const testNoFacetPages = async (collection, category, categoryPath, usedFacets) => {
      if (usedFacets.size) {
        return
      }

      const facetBrowseDir = join(
        rootDirectory,
        exportDirectory,
        collection.slug,
        categoryPath,
        FACET_BROWSE_PATH
      )

      try {
        await stat(facetBrowseDir)
        t.fail(
          `${collection.slug}/${categoryPath}/by directory should not exist when no facets are used`
        )
      } catch (err) {
        if (err.code === 'ENOENT') {
          t.ok(
            true,
            `${collection.slug}/${categoryPath}/by directory does not exist when no facets are used`
          )
        } else {
          t.fail(
            `${collection.slug}/${categoryPath}/by check failed: ${err.message}`
          )
        }
      }
    }

    for (const collection of FIXTURE_CONTENT_MODEL.collections) {
      if (!collection.categories || !collection.categories.length) {
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
