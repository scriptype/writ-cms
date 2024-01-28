const Settings = require('../settings')
const Debug = require('../debug')

const defaultLocale = 'en'

module.exports = {
  dictionaries: {
    // BCP 47 language tag
    en: require('./locales/en.json'),
    fi: require('./locales/fi.json'),
    tr: require('./locales/tr.json')
  },

  init({ decorators }) {
    Debug.timeStart('dictionary')
    const dictionaryDecorator = decorators.dictionary
    const selectedLocale = Settings.getSettings().language
    if (selectedLocale in this.dictionaries) {
      this.locale = selectedLocale
    } else {
      this.locale = defaultLocale
    }
    Debug.debugLog('locale', this.locale)
    this.dictionary = dictionaryDecorator(this.dictionaries[this.locale])
    Debug.timeEnd('dictionary')
    return this
  },

  // can key be like 'my.nested.key'?
  lookup(key, ...params) {
    if (!(key in this.dictionary)) {
      Debug.debugLog(`unrecognized word: ${key} in: ${this.locale}`)
      return ''
    }
    const word = this.dictionary[key]
    const variables = word.match(/\$(\w+)/g) || []
    let result = word
    variables.forEach((variable, i) => {
      result = result.replace(new RegExp(`\\${variable}`), params[i] || '')
    })
    return result
  },

  lookupForeign(locale, key) {
    if (!(locale in this.dictionaries)) {
      Debug.debugLog(`unrecognized locale: ${locale}`)
      return ''
    }
    const foreignLocale = this.dictionaries[locale]
    if (!(key in foreignLocale)) {
      Debug.debugLog(`unrecognized word: ${key} in: ${this.locale}`)
      return ''
    }
    return foreignLocale[key]
  },

  use(type, value) {
    const that = this
    switch (type) {
      case "templateHelpers":
        return {
          ...value,
          dictionary(key, ...params) {
            return that.lookup.call(that, key, ...params)
          }
        }
    }
    return value
  }
}
