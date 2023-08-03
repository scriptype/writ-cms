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
  }
}
