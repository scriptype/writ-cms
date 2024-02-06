const { DecoratorFactory } = require('../decorations')

const expand = (initialValue, fns) => {
  return fns.reduce((value, fn) => fn(value), initialValue)
}

const createHooksDecorator = new DecoratorFactory((state) => {
  let decorator = {}
  for (let key in state.hooks) {
    if (state.hooks.hasOwnProperty(key)) {
      const hookFns = state.hooks[key]
      if (hookFns.length) {
        decorator[key] = (value) => expand(value, hookFns)
      }
    }
  }
  return decorator
})

module.exports = createHooksDecorator
