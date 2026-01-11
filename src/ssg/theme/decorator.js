const { join } = require('path')
const { DecoratorFactory } = require('../decorations')
const Settings = require('../settings')
const {
  ASSETS,
  PARTIALS,
  TEMPLATE_HELPERS
} = require('./constants')

const createThemeDecorator = new DecoratorFactory((state, methods) => {
  const { rootDirectory, themeDirectory, theme } = Settings.getSettings()
  const customThemePath = join(rootDirectory, themeDirectory)
  const baseThemePath = join(__dirname, '..', '..', '..', 'packages', `theme-${theme}`)

  return {
    templateHelpers: (value) => {
      const commonTemplateHelpers = require(
        join(__dirname, 'common', TEMPLATE_HELPERS.from)
      )

      let themeTemplateHelpers = {}
      try {
        themeTemplateHelpers = require(join(baseThemePath, TEMPLATE_HELPERS.from))
      } catch {}

      let customTemplateHelpers = {}
      try {
        customTemplateHelpers = require(
          join(customThemePath, PARTIALS.to, TEMPLATE_HELPERS.to)
        )
      } catch {}

      const customizers = state.customizers
      const customizerHelpers = {
        hasCustomStyle() {
          return customizers.includes('style.css')
        },
        hasThemeSettings() {
          return customizers.includes('theme-settings.css')
        },
        hasCustomScript() {
          return customizers.includes('script.js')
        }
      }

      return {
        ...value,
        ...commonTemplateHelpers,
        ...themeTemplateHelpers,
        ...customTemplateHelpers,
        ...customizerHelpers,
      }
    },

    templatePartials: (value) => {
      return [
        ...value,
        join(__dirname, 'common', PARTIALS.from),
        join(baseThemePath, PARTIALS.from),
        join(customThemePath, PARTIALS.to)
      ]
    },

    assets: (value) => {
      return [
        ...value,
        {
          src: join(customThemePath, ASSETS),
          dest: ''
        },
        ...state.customizers.map(path => ({
          src: join(customThemePath, path),
          dest: 'custom',
          single: true
        })),
        {
          src: join(__dirname, 'common', 'assets'),
          dest: 'common'
        }
      ]
    }
  }
})

module.exports = createThemeDecorator
