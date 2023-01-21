/*
 * Debug should be kept separate from settings,
 * because settings should be able to depend on helpers.
 * This way there's no cross-dependency + clarity
 */
let debug = false

const getDebug = () => {
  return debug
}

const debugLog = (...args) => {
  if (getDebug()) {
    console.log(...args)
  }
}

const init = (debug2) => {
  debug = debug2
}

module.exports = {
  debugLog,
  getDebug,
  init
}
