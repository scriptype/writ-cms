const Debug = require('./debug')
const { curry, pipe } = require('./helpers')

const createDecorations = () => {
  const decorations = {
    dictionary: [],
    assets: [],
    contentModel: [],
    previewApi: [],
    templateHelpers: [],
    templatePartials: [],
    template: [],
    publishDate: []
  }

  return {
    get(key) {
      if (key) {
        return decorations[key]
      }
      return decorations
    },
    reset() {
      Object.keys(decorations).forEach(key => decorations[key] = [])
      return decorations
    }
  }
}

const decorations = createDecorations()

const registerDecoration = (decoration) => {
  Object.keys(decoration).forEach(key => {
    decorations.get(key).push(decoration[key])
  })
}

const register = (...decorators) => {
  decorations.reset()
  decorators.forEach(config => {
    if (Array.isArray(config)) {
      config.forEach(registerDecoration)
    } else {
      registerDecoration(config)
    }
  })
  Debug.debugLog('decorations', decorations.get())
}

const decorate = (key, initialValue) => {
  const decoration = decorations.get(key)
  const decorated = pipe(initialValue, decoration)
  return decorated
}

class DecoratorFactory {
  constructor(fn) {
    return curry(fn)
  }
}

module.exports = {
  register,
  decorate,
  DecoratorFactory
}
