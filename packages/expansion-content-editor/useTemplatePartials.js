const { resolve } = require('path')

const useTemplatePartials = (mode) =>
  () => resolve(__dirname, './partials')

module.exports = useTemplatePartials
