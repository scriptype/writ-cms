const Settings = require('../settings')
const Debug = require('../debug')
const { decorate } = require('../decorations')
const createDecorator = require('./decorator')

const State = {
  locale: 'en',
  dictionary: {},
  dictionaries: {
    // BCP 47 language tag
    en: require('./locales/en.json'),
    fi: require('./locales/fi.json'),
    tr: require('./locales/tr.json')
  }
}

const Methods = (() => {
  const init = async () => {
    Debug.timeStart('dictionary')
    const selectedLocale = Settings.getSettings().language
    if (selectedLocale in State.dictionaries) {
      State.locale = selectedLocale
    }
    Debug.debugLog('locale', State.locale)
    State.dictionary = await decorate('dictionary', State.dictionaries[State.locale])
    Debug.timeEnd('dictionary')
  }

  // can key be like 'my.nested.key'?
  const lookup = (key, variables = {}) => {
    if (!(key in State.dictionary)) {
      Debug.debugLog(`unrecognized word: ${key} in: ${State.locale}`)
      return ''
    }
    const translation = State.dictionary[key]
    let result = translation
    Object.keys(variables).forEach(key => {
      const variable = variables[key]
      result = result.replace('{{' + key + '}}', variable || '')
    })
    return result
  }

  const lookupForeign = (locale, key) => {
    if (!(locale in State.dictionaries)) {
      Debug.debugLog(`unrecognized locale: ${locale}`)
      return ''
    }
    const foreignLocale = State.dictionaries[locale]
    if (!(key in foreignLocale)) {
      Debug.debugLog(`unrecognized word: ${key} in: ${State.locale}`)
      return ''
    }
    return foreignLocale[key]
  }

  return {
    init,
    lookup,
    lookupForeign
  }
})()

module.exports = {
  ...Methods,
  decorator: createDecorator(State, Methods)
}
