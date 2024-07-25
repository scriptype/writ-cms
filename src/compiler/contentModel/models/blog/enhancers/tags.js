/*
 * Build up contentModel.tags by extracting tags from entries.
 *
 * Extract tags from entries as an array of tags with posts
 * returns: 
 * */
const withTags = (entries) => {
  // Map entries onto their tags
  const tags = entries.map((entry) => {
    return entry.tags.map((tag) => {
      return { tag, entry }
    })
  })

  // Flatten the list of tag-entry objects.
  const flatTags = [].concat(...tags)

  // Merge tag-entry objects
  const tagsIndex = flatTags.reduce((acc, tagWithEntry) => {
    const { tag, entry } = tagWithEntry
    return {
      ...acc,
      [tag.tag]: {
        ...tag,
        entries: [
          ...(acc[tag.tag] ? acc[tag.tag].entries : []),
          entry
        ]
      }
    }
  }, {})

  // Convert into an array of tags sorted by number of entries
  return Object
    .keys(tagsIndex)
    .map(key => tagsIndex[key])
    .sort((a, b) => b.entries.length - a.entries.length)
}

module.exports = withTags
