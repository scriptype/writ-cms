module.exports = {
  dateUTC(date) {
    return date.toUTCString()
  },

  dateFull(date) {
    return date.toLocaleString('en', { dateStyle: 'full' })
  },

  publishDateLong(date) {
    return date.toLocaleString('en', { dateStyle: 'long' })
  },

  dateMedium(date) {
    return date.toLocaleString('en', { dateStyle: 'medium' })
  },

  dateShort(date) {
    return date.toLocaleString('en', { dateStyle: 'short' })
  },

  is(value1, value2) {
    return value1 === value2
  },

  isNot(value1, value2) {
    return value1 !== value2
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
    return this.page === 'homepage'
  },

  isCategoryPage() {
    return this.page === 'category'
  },

  isCollectionPage() {
    return this.page === 'collection'
  },

  assetsPath() {
    const { permalinkPrefix, assetsDirectory } = this.settings
    const prefix = permalinkPrefix === '/' ? '' : permalinkPrefix
    return prefix + '/' + assetsDirectory
  },

  pageTitle() {
    if (this.page === 'post') {
      return `${this.post.title} / ${this.settings.site.title}`
    }
    if (this.page === 'subpage') {
      return `${this.subpage.title} / ${this.settings.site.title}`
    }
    if (this.page === 'category') {
      return `${this.category.title} / ${this.settings.site.title}`
    }
    if (this.page === 'tag') {
      return `#${this.tag.tag} / ${this.settings.site.title}`
    }
    if (this.page === 'homepage' && this.homepage.title) {
      return `${this.homepage.title} / ${this.settings.site.title}`
    }
    return `${this.settings.site.title}`
  },

  map(...keyValues) {
    return keyValues.reduce((result, keyOrValue, index) => {
      if (index % 2 > 0) {
        return result
      }
      return {
        ...result,
        [keyOrValue]: keyValues[index + 1]
      }
    }, {})
  },

  // TODO: Adapt mentions to new content model
  mention(permalink, options) {
    const pattern = new RegExp('^(|\/)' + permalink)
    const entry = [
      this.homepage,
      ...this.posts,
      ...this.categories,
      ...this.subpages
    ].find(e => pattern.test(e.permalink))
    if (options.fn) {
      return options.fn(entry)
    }
    return `<a href="${entry.permalink}">${entry.title}</a>`
  },
}
