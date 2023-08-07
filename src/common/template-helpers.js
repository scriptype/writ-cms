const Handlebars = require('handlebars')
const { join } = require('path')
const { permalinkPrefix, assetsDirectory } = require('../settings').getSettings()

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
    return join(permalinkPrefix, assetsDirectory)
  },

  permalinkPrefix() {
    return permalinkPrefix
  },

  hasCustomStyle() {
    if (!this.customTheme) {
      return false
    }
    return this.customTheme.assets.some(({ name }) => name === 'style.css')
  },

  hasCustomScript() {
    if (!this.customTheme) {
      return false
    }
    return this.customTheme.assets.some(({ name }) => name === 'script.js')
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
