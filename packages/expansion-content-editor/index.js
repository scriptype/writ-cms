const { resolve } = require('path')
const { Post, Category } = require('./content')

module.exports = (mode) => {
  return {
    useTemplateHelpers(helpers) {
      return {
        seeMore: mode === 'start' ? `
        <img
          data-editable="true"
          data-section="summary"
          src="/assets/default/transparent.png" />
        ` : helpers.seeMore,
        lorem: 'hele'
      }
    },

    useTemplate(template) {
      return template + (mode === 'start' ? '{{> content-editor }}' : '')
    },

    useContent(contentModel) {
      return mode === 'start' ?
        {
          ...contentModel,
          posts: contentModel.posts.map(Post),
          categories: contentModel.categories.map(Category)
        } :
        contentModel
    },

    usePreviewApi() {
      return [
        {
          route: "/cms/post",
          handle: require('./api/post')
        }
      ]
    },

    useTemplatePartials() {
      return resolve(__dirname, './partials')
    },

    useAssets() {
      return [
        {
          src: resolve(__dirname, './static'),
          dest: 'expansions/content-editor'
        }
      ]
    }
  }
}
