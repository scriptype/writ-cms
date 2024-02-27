const { rightPad } = require('./helpers')

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
  performance.measure(name, name)
}

const logTimes = () => {
  const measurements = performance.getEntriesByType('measure')
  if (!getDebug() || !measurements.length) {
    return
  }
  const title = '\nPerformance (in milliseconds)'
  const titleLength = title.trim().length
  debugLog([title, '-'.repeat(titleLength)].join('\n'))
  const decimals = 4
  const longestMeasurement = measurements.sort(
    (a, b) => a.duration - b.duration
  )[0].duration.toFixed(decimals)
  const longestSignificantDigits = String(parseInt(longestMeasurement)).length
  measurements.forEach(measurement => {
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
