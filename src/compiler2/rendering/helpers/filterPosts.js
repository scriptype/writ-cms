const filterPosts = (page, posts) => {
  const filters = {
    // TODO: i18n
    exclude: page['exclude post types'],
    include: page['include post types']
  }

  const excludedPostTypes = filters.exclude ?
    filters.exclude.split(',').map(t => t.trim()) :
    []

  const includedPostTypes = filters.include ?
    filters.include.split(',').map(t => t.trim()) :
    []

  return posts
    .filter(({ type }) => !excludedPostTypes.includes(type))
    .filter(({ type }) => (
      !includedPostTypes.length || includedPostTypes.includes(type))
    )
}

module.exports = {
  filterPosts
}
