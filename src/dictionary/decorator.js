const { join, resolve } = require('path')
const { DecoratorFactory } = require('../decorations')

const createDictionaryDecorator = new DecoratorFactory((state, methods) => {
  return {
    templateHelpers: (value) => {
      return {
        ...value,
        lookup(key, params) {
          return methods.lookup(key, params)
        }
      }
    },

    assets: (value) => {
      return [
        ...value,
        {
          src: resolve(__dirname, './static', 'dictionary.js'),
          dest: join('common'),
          single: true
        },
        {
          src: resolve(__dirname, 'locales', state.locale + '.json'),
          dest: join('common'),
          rename: 'dictionary.json',
          single: true
        }
      ]
    }
  }
})

module.exports = createDictionaryDecorator
