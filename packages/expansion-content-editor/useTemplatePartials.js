const { resolve } = require('path')

const useTemplatePartials = (mode) =>
  (value) => {
    if (mode !== 'start') {
      return value
    }
    return [
      ...value,
      resolve(__dirname, './partials')
    ]
  }

module.exports = useTemplatePartials
