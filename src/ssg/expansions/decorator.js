const Settings = require('../settings')
const { DecoratorFactory } = require('../decorations')

const createExpansionsDecorator = new DecoratorFactory((state) => {
  const settings = Settings.getSettings()
  return state.expansions.map(exp => exp(settings))
})

module.exports = createExpansionsDecorator
