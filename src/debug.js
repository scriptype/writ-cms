const { performance } = require('node:perf_hooks')

let debug = false

const getDebug = () => {
  return debug
}

const debugLog = (...args) => {
  if (getDebug()) {
    console.log(...args)
  }
}

const timeStart = (name) => {
  performance.mark(name)
}

const timeEnd = (name) => {
  performance.mark(`${name} end`)
  const measurement = performance.measure(`${name} time`, name, `${name} end`)
  debugLog(measurement.name, '(in seconds)', measurement.duration / 1000);
}

const init = (debug2) => {
  debug = debug2
  performance.clearMarks()
  performance.clearMeasures()
}

module.exports = {
  debugLog,
  getDebug,
  timeStart,
  timeEnd,
  init
}
