const Handlebars = require('handlebars')
const { join } = require('path')
const Settings = require('../settings')
const CustomTheme = require('../custom-theme')

module.exports = {
  multiLineTextList(list) {
    if (typeof list === 'string') {
      return list
    }
    return list
      .map(s => s.trim()).filter(Boolean)
      .map(s => `<li>${Handlebars.escapeExpression(s)}</li>`)
      .join('\n')
  },

  seeMore() {
    return ''
  },

  isPostType(string, type) {
    return string === type
  },

  filterPostsByType(type) {
    return this.posts.filter(p => p.type === type)
  },

  assetsPath() {
    const { permalinkPrefix, assetsDirectory } = Settings.getSettings()
    return join(permalinkPrefix, assetsDirectory)
  },

  permalinkPrefix() {
    const { permalinkPrefix } = Settings.getSettings()
    return permalinkPrefix
  },

  hasCustomStyle() {
    if (!CustomTheme.assets.length) {
      return false
    }
    const { themeDirectory } = Settings.getSettings()
    return CustomTheme.assets.some((path) => path === `${themeDirectory}/style.css`)
  },

  hasCustomScript() {
    if (!CustomTheme.assets.length) {
      return false
    }
    const { themeDirectory } = Settings.getSettings()
    return CustomTheme.assets.some((path) => path === `${themeDirectory}/script.js`)
  },

  pageTitle() {
    if (this.page === 'post' || this.page === 'subpage') {
      return `${this.title} / ${this.site.title}`
    }
    if (this.page === 'category') {
      return `${this.category.name} / ${this.site.title}`
    }
    return `${this.site.title}`
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
