const { performance } = require('node:perf_hooks')
const { rightPad } = require('./helpers')

let debug = false
let finishedMeasurements = []

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
  const measurement = performance.measure(name, name, `${name} end`)
  finishedMeasurements.push(measurement)
}

const logTimes = () => {
  if (!getDebug() || !finishedMeasurements.length) {
    return
  }
  const title = '\nPerformance (in milliseconds)'
  const titleLength = title.trim().length
  debugLog([title, '-'.repeat(titleLength)].join('\n'))
  const decimals = 4
  const longestMeasurement = [...finishedMeasurements].sort(
    (a, b) => b.duration - a.duration
  )[0].duration.toFixed(decimals)
  const longestSignificantDigits = String(parseInt(longestMeasurement)).length
  finishedMeasurements.forEach(measurement => {
    const value = parseFloat(measurement.duration.toFixed(decimals))
    const shiftAmount = longestSignificantDigits - String(parseInt(value)).length
    const name = rightPad(
      measurement.name,
      titleLength - 1 - longestMeasurement.length + shiftAmount
    )
    debugLog(name, value)
  })
}

const init = (debug2) => {
  debug = debug2
  finishedMeasurements = []
  performance.clearMarks()
  performance.clearMeasures()
}

module.exports = {
  debugLog,
  getDebug,
  timeStart,
  timeEnd,
  logTimes,
  init
}
