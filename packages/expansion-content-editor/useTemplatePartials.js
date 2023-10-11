const { resolve } = require('path')

const useTemplatePartials = (mode) =>
  (value) => {
    return [
      ...value,
      resolve(__dirname, './partials')
    ]
  }

module.exports = useTemplatePartials
