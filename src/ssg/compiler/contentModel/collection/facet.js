const { join } = require('path')
const makeSlug = require('slug')
const { makePermalink, makeDateSlug } = require('../../../lib/contentModelHelpers')

function serializeLinkedFacet(facetValue) {
  return facetValue.slug ?
    JSON.stringify({
      title: facetValue.title,
      slug: facetValue.slug
    }) :
    facetValue
}

function upsertFacetValueWithPost(facet, facetValue, post) {
  const key = serializeLinkedFacet(facetValue)
  const collectedPosts = facet.map.get(key)
  if (collectedPosts) {
    collectedPosts.push(post)
  } else {
    facet.map.set(key, [post])
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

        } else {
          upsertFacetValueWithPost(facet, facetValue, post)
        }

      } else {
        const map = new Map()

        if (Array.isArray(facetValue)) {
          facetValue.forEach(facetValueItem => {
            const key = serializeLinkedFacet(facetValueItem)
            map.set(key, [post])
          })

        } else if (facetValue instanceof Date) {
          const dateSlug = facetValue.toISOString().split('T')[0]
          map.set(dateSlug, [post])

        } else {
          const key = serializeLinkedFacet(facetValue)
          map.set(key, [post])
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

function linkWithEntryFields(entry, facets, facetKeys) {
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
      entry[facetKey] = facetValue.map(item => {
        if (!item.slug) {
          return createFacetField(facet, item)
        }
        return {
          ...item,
          facetPermalink: makeFacetPermalink(facet, item.slug)
        }
      })
    } else {
      entry[facetKey] = createFacetField(facet, facetValue)
    }
  })
}

function serialize(facet) {
  return {
    ...facet,
    title: facet.key,
    get keys() {
      return Array.from(facet.map.keys())
    },
    get entries() {
      return Array.from(facet.map, ([key, value]) => {
        let linkedFacet
        try {
          linkedFacet = JSON.parse(key)
        } catch { }
        const slug = linkedFacet ? linkedFacet.slug : makeSlug(key)
        return {
          key: linkedFacet ? linkedFacet.title : key,
          value,
          slug
        }
      })
    }
  }
}

function Facet() {
  const addressSegment = 'by' // alt: browse, filter, view

  return {
    collectFacets,

    serialize,

    linkWithEntryFields,

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
      const presentationFacets = facets.map(serialize)

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
                basePermalink: facetValue.permalink,
                posts: facetValue.value,
                postsPerPage: 15,
                outputDir: join(facet.outputPath, facetValue.slug),
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
          }).flat()
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