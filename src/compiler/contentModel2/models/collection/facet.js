const { join } = require('path')
const makeSlug = require('slug')
const { makePermalink, makeDateSlug } = require('../../helpers')

function upsertFacetValueWithPost(facet, facetValue, post) {
  const collectedPosts = facet.map.get(facetValue)
  if (collectedPosts) {
    collectedPosts.push(post)
  } else {
    facet.map.set(facetValue, [post])
  }
}

function collectFacets(posts, facetKeys, context) {
  const facets = []
  posts.forEach(post => {
    facetKeys.forEach(facetKey => {
      const facetValue = post[facetKey]
      if (!facetValue) {
        return
      }

      const facet = facets.find(f => f.key === facetKey)
      if (facet) {
        if (Array.isArray(facetValue)) {
          facetValue.forEach(facetValueItem => {
            upsertFacetValueWithPost(facet, facetValueItem, post)
          })

        } else if (facetValue instanceof Date) {
          const dateSlug = makeDateSlug(facetValue)
          upsertFacetValueWithPost(facet, dateSlug, post)

        } else if (facetValue.slug) {
          upsertFacetValueWithPost(facet, facetValue.slug, post)

        } else {
          upsertFacetValueWithPost(facet, facetValue, post)
        }

      } else {
        const map = new Map()

        if (Array.isArray(facetValue)) {
          facetValue.forEach(facetValueItem => {
            map.set(facetValueItem, [post])
          })

        } else if (facetValue instanceof Date) {
          const dateSlug = facetValue.toISOString().split('T')[0]
          map.set(dateSlug, [post])

        } else if (facetValue.slug) {
          map.set(facetValue.slug, [post])

        } else {
          map.set(facetValue, [post])
        }

        if (map.size > 0) {
          const newFacet = Facet().create(facetKey, map, context)
          facets.push(newFacet)
        }
      }

    })
  })
  return facets
}

function makeFacetPermalink(facet, slug) {
  return makePermalink(facet.permalink, slug)
}

function createFacetField(facet, value) {
  const slug = value instanceof Date ? makeDateSlug(value) : makeSlug(value)
  return {
    value,
    facetPermalink: makeFacetPermalink(facet, slug)
  }
}

function linkEntryFieldsToFacets(entry, facets) {
  const facetsContext = entry.context.throwUntil(c => c.facetKeys).peek()
  const facetKeys = facetsContext.facetKeys
  if (!facetKeys || !facetKeys.length) {
    return
  }
  facetKeys.forEach(facetKey => {
    const facetValue = entry[facetKey]
    if (!facetValue || (Array.isArray(facetValue) && !facetValue.length)) {
      return
    }
    const facet = facets.find(f => f.key === facetKey)
    if (facetValue?.slug) {
      facetValue.facetPermalink = makeFacetPermalink(facet, facetValue.slug)
    } else if (Array.isArray(facetValue)) {
      entry[facetKey] = facetValue.map(item => createFacetField(facet, item))
    } else {
      const field = createFacetField(facet, facetValue)
      entry[facetKey] = field
    }
  })
}

function Facet() {
  const addressSegment = 'by' // alt: browse, filter, view

  return {
    collectFacets,

    linkEntryFieldsToFacets,

    create: (key, map, context) => {
      const slug = makeSlug(key)
      const permalink = makePermalink(context.peek().permalink, addressSegment, slug)
      const outputPath = join(context.peek().outputPath, addressSegment, slug)
      return {
        key,
        map,
        slug,
        permalink,
        outputPath,
        context
      }
    },

    afterEffects: (contentModel, facet) => {},

    render: (renderer, facets, { contentModel, settings, debug }) => {
      const presentationFacets = facets.map(f => ({
        ...f,
        title: f.key,
        get keys() {
          return Array.from(f.map.keys())
        },
        get entries() {
          return Array.from(f.map, ([key, value]) => ({
            key,
            value,
            slug: makeSlug(key)
          }))
        }
      }))

      // /by
      const renderAllFacetsPage = () => {
        if (!presentationFacets.length) {
          return Promise.resolve()
        }
        const container = presentationFacets[0].context.peek()
        return renderer.render({
          templates: ['pages/facets/allFacets'],
          outputPath: join(container.outputPath, addressSegment, 'index.html'),
          data: {
            ...contentModel,
            facets: presentationFacets,
            settings,
            debug
          }
        })
      }

      // /by/key
      const renderFacetKeys = () => {
        if (!presentationFacets.length) {
          return Promise.resolve()
        }
        return Promise.all(
          presentationFacets.map(facet => {
            const container = facet.context.peek()
            return renderer.render({
              templates: ['pages/facets/facetKeys'],
              outputPath: join(facet.outputPath, 'index.html'),
              data: {
                ...contentModel,
                facet,
                settings,
                debug
              }
            })
          })
        )
      }

      // /by/key/value
      const renderFacetKeyPosts = () => {
        return Promise.all(
          presentationFacets.map(facet => {
            const container = facet.context.peek()
            return facet.entries.map(facetValue => {
              return renderer.paginate({
                page: facetValue,
                posts: facetValue.value,
                postsPerPage: 15,
                outputDir: join(facet.outputPath, makeSlug(facetValue.key)),
                render: async ({ outputPath, pageOfPosts, paginationData }) => {
                  return renderer.render({
                    templates: [`pages/facets/facetKeyPosts`],
                    outputPath,
                    data: {
                      ...contentModel,
                      facetValue: {
                        title: facetValue.key,
                        posts: facetValue.value
                      },
                      pagination: paginationData,
                      posts: pageOfPosts,
                      settings,
                      debug
                    }
                  })
                }
              })
            })
          })
        )
      }

      return Promise.all([
        renderAllFacetsPage(),
        renderFacetKeys(),
        renderFacetKeyPosts()
      ])
    }
  }
}

module.exports = Facet
