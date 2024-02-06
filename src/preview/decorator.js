const { resolve, join } = require('path')
const Settings = require('../settings')
const { DecoratorFactory } = require('../decorations')

const createPreviewDecorator = new DecoratorFactory((state, methods) => {
  const { mode } = Settings.getSettings()
  if (mode !== 'start') {
    return {}
  }
  return {
    template: (value) => {
      return value + '{{> preview }}'
    },

    templatePartials: (value) => {
      return [
        ...value,
        resolve(join(__dirname, 'partials'))
      ]
    },

    assets: (value) => {
      return [
        ...value,
        {
          src: resolve(__dirname, './static'),
          dest: 'preview'
        }
      ]
    }
  }
})

module.exports = createPreviewDecorator
