const getTranscript = (post) => {
  const paths = [
    post.transcript,
    /transcript\.(txt|srt|html)$/,
    /.srt$/,
  ]
  const pathExpressions = paths.filter(Boolean).map(p => new RegExp(p))
  const matchingAssets = pathExpressions
    .map(path => {
      return post.localAssets.find(({ name }) => {
        return path.test(name)
      })
    })
    .filter(Boolean)
  const [firstMatch] = matchingAssets
  return firstMatch && firstMatch.content
}

module.exports = {
  hasTranscript() {
    return !!getTranscript(this)
  },

  transcript() {
    return getTranscript(this)
  },

  multiLineTextList(list) {
    if (typeof list === 'string') {
      return list
    }
    return list
      .map(s => s.trim()).filter(Boolean)
      .map(s => `<li>${s}</li>`)
      .join('\n')
  },

  seeMore() {
    return ''
  },

  filterPostsByType(type) {
    return this.posts.filter(p => p.type === type)
  },

  assetsPath() {
    const { permalinkPrefix, assetsDirectory } = this.settings
    const prefix = permalinkPrefix === '/' ? '' : permalinkPrefix
    return prefix + '/' + assetsDirectory
  },

  pageTitle() {
    if (this.page === 'post' || this.page === 'subpage') {
      return `${this.title} / ${this.settings.site.title}`
    }
    if (this.page === 'category') {
      return `${this.category.name} / ${this.settings.site.title}`
    }
    return `${this.settings.site.title}`
  },

  is(value1, value2) {
    return value1 === value2
  },

  isNot(value1, value2) {
    return value1 !== value2
  },

  isEnabled(featureName) {
    const feature = this.settings[featureName]
    switch (featureName) {
      case 'syntaxHighlighting': return feature !== 'off'
      case 'search': return feature !== 'off'
    }
  },

  featSearchResults() {
    return this.settings.search !== 'off' ? ' id="feat-search-results" ' : ''
  },

  isStartMode() {
    return this.settings.mode === 'start'
  },

  isBuildMode() {
    return this.settings.mode === 'build'
  },

  isPostPage() {
    return this.page === 'post'
  },

  isSubPage() {
    return this.page === 'subpage'
  },

  isHomePage() {
    return this.page === 'home'
  },

  isCategoryPage() {
    return this.page === 'category'
  }
}
