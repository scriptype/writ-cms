module.exports = {
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

  isStartMode() {
    return this.settings.mode === 'start'
  },

  isBuildMode() {
    return this.settings.mode === 'build'
  },

  isPostType(string, type) {
    return string === type
  },

  filterPostsByType(type) {
    return this.posts.filter(p => p.type === type)
  },

  assetsPath() {
    const { permalinkPrefix, assetsDirectory } = this.settings
    const prefix = permalinkPrefix === '/' ? '' : permalinkPrefix
    return prefix + '/' + assetsDirectory
  },

  hasCustomStyle() {
    return false
    /*
    if (!CustomTheme.assets.length) {
      return false
    }
    const { themeDirectory } = Settings.getSettings()
    return CustomTheme.assets.some((path) => path === `${themeDirectory}/style.css`)
    */
  },

  hasCustomScript() {
    return false
    /*
    if (!CustomTheme.assets.length) {
      return false
    }
    const { themeDirectory } = Settings.getSettings()
    return CustomTheme.assets.some((path) => path === `${themeDirectory}/script.js`)
    */
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
