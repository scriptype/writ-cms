const FACET_BROWSE_PATH = 'by'

/*
 * Flattens all posts from a fixture model by extracting posts from all
 * collections and their nested categories.
 */
const flattenAllPosts = (fixtureModel) => {
  let allPosts = []
  for (const collection of fixtureModel.collections) {
    allPosts = [
      ...allPosts,
      ...flattenPostsFromCategories(collection.categories, collection.posts)
    ]
  }
  return allPosts
}

/*
 * Slugifies a string by converting to lowercase, replacing spaces and
 * underscores with hyphens, and removing special characters.
 * Handles UTF-8 characters by removing diacritics.
 */
const slug = (str) => {
  if (typeof str !== 'string') {
    return str
  }

  return str
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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
    slug(facetValue) :
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

module.exports = {
  FACET_BROWSE_PATH,
  flattenAllPosts,
  slug,
  flattenPostsFromCategories,
  getUsedFacets,
  getExpectedFacetValues,
  getFacetValueSlug,
  getFacetValueTitle
}