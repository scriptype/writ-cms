const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')
const createDecorator = require('./decorator')

const State = {
  expansions: []
}

const Methods = (() => {
  const init = () => {
    Debug.timeStart('expansions')
    const { expansions } = Settings.getSettings()
    State.expansions = expansions.map(exp => {
      const pkgPath = join(__dirname, '..', '..', 'packages', `expansion-${exp}`)
      return require(pkgPath)
    })
    Debug.debugLog('expansions', State.expansions)
    Debug.timeEnd('expansions')
  }

  return {
    init
  }
})()

module.exports = {
  ...Methods,
  decorator: createDecorator(State, Methods)
}
