const { tmpdir } = require('os')
const { join } = require('path')
const { readdir, mkdir, rm, readFile, cp } = require('fs/promises')
const test = require('tape')
const { load } = require('cheerio')
const writ = require('..')

const fixturesDirectory = join(__dirname, 'fixtures', 'e2e-magazine')

const isValidCollectionPost = (fileName) => {
  const validExtensions = ['.md', '.txt', '.html']
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  return validExtensions.includes(extension)
}

const isCollectionIndexFile = (fileName) => {
  const indexFileNames = ['collection.md', 'blog.md']
  return indexFileNames.includes(fileName)
}

const DOM_SELECTORS = {
  pageTitle: 'title',
  collectionHeader: 'header',
  collectionTitle: 'h3',
  collectionTitleLink: 'a',
  collectionPostList: 'ul, ol',
  collectionFacets: '.collection-facets',
  subpagesHeading: 'h2',
  subpagesList: 'ul, ol'
}

test('E2E Magazine', t => {

  t.test('Build magazine from fixture', async t => {
    t.plan(6)

    const testDir = join(tmpdir(), 'e2e-magazine-build')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const expectedPageTitle = 'Home'
    const expectedSiteTitle = 'Web Maganize'
    const collectionsWithMetadata = [
      { name: 'events', facets: [] },
      { name: 'books', facets: ['author', 'date', 'tags', 'genre'] },
      { name: 'demos', facets: ['tags', 'date', 'maker'] },
      { name: 'authors', facets: ['events'] }
    ]
    // Facets are only listed if at least one post in the collection uses them in front-matter
    // Date is automatically added to every post by the system
    const collectionsViaAlias = [
      { name: 'articles', fileName: 'blog', facets: ['tags', 'date', 'author'] }
    ]
    const subpages = ['/about-us.html', '/newsletter.html']

    try {
      await mkdir(testDir, { recursive: true })
      await cp(fixturesDirectory, rootDirectory, { recursive: true })

      await writ.build({
        rootDirectory
      })

      const [
        exportDirectoryContents,
        indexHtmlContent
      ] = await Promise.all([
        readdir(join(rootDirectory, exportDirectory)),
        readFile(join(rootDirectory, exportDirectory, 'index.html'), { encoding: 'utf-8' })
      ])

      const $ = load(indexHtmlContent)
      const pageTitle = $(DOM_SELECTORS.pageTitle).text()

      t.ok(
        pageTitle.includes(expectedPageTitle) && pageTitle.includes(expectedSiteTitle),
        'index.html title contains both homepage title and site title'
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
      const collectionStructureIsValid = allCollections.every(collection => {
        const headers = $(DOM_SELECTORS.collectionHeader)
        let hasValidStructure = false

        headers.each((_, header) => {
          const titleElement = $(header).find(DOM_SELECTORS.collectionTitle)
          const titleLink = titleElement.find(DOM_SELECTORS.collectionTitleLink)
          const titleText = titleElement.text()
          const postList = $(header).next(DOM_SELECTORS.collectionPostList)

          const isCorrectCollection = titleText.toLowerCase().includes(collection.name)
          const hasLink = titleLink.length > 0
          const hasPostList = postList.length > 0

          if (isCorrectCollection && hasLink && hasPostList) {
            hasValidStructure = true
          }
        })

        return hasValidStructure
      })

      t.ok(
        collectionStructureIsValid,
        'each collection is listed with its title as a link and its posts'
      )

      const facetsListed = allCollections.every(collection => {
        const headers = $(DOM_SELECTORS.collectionHeader)
        let facetCheckPassed = false

        headers.each((_, header) => {
          const titleElement = $(header).find(DOM_SELECTORS.collectionTitle)
          const titleText = titleElement.text()
          const isCorrectCollection = titleText.toLowerCase().includes(collection.name)

          if (isCorrectCollection) {
            const facetsContainer = $(header).find(DOM_SELECTORS.collectionFacets)

            if (collection.facets.length === 0) {
              facetCheckPassed = facetsContainer.length === 0
            } else {
              const facetLinks = facetsContainer.find('a')
              const facetTexts = facetLinks.map((_, link) => $(link).text().toLowerCase()).get()

              const allFacetsFound = collection.facets.every(facet =>
                facetTexts.some(text => text.includes(facet.toLowerCase()))
              )

              const browsePathExists = facetTexts.length > 0

              facetCheckPassed = allFacetsFound && browsePathExists
            }
          }
        })

        return facetCheckPassed
      })

      t.ok(
        facetsListed,
        'each collection with facets has all facets and browse link listed next to its title'
      )

      const pagesHeading = $(`${DOM_SELECTORS.subpagesHeading}:contains("Pages")`)
      const subpagesSectionFound = pagesHeading.length > 0

      let allSubpagesListed = false
      if (subpagesSectionFound) {
        const subpagesList = pagesHeading.next(DOM_SELECTORS.subpagesList)
        const subpageLinks = subpagesList.find('a')
        const pageHrefs = subpageLinks.map((_, link) => $(link).attr('href')).get()

        allSubpagesListed = subpages.every(subpage =>
          pageHrefs.includes(subpage)
        )
      }

      t.ok(
        allSubpagesListed,
        'all subpages are listed under Pages section'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})