const { platform } = require('os')
const { readdir, mkdir, rm, writeFile, readFile } = require('fs/promises')

const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration))

/*
 * Retry an operation when Windows file handles prevent immediate access.
 * On Windows, fs operations may fail with EBUSY if file handles aren't
 * released yet. This retries the operation with backoff until it succeeds,
 * mimicking the atomic pattern of building in isolation before swap.
 */
const atomicFS = (() => {
  const retryUntilSuccess = async (fn, maxRetries = 10, delayMS = 50) => {
    if (platform() !== 'win32') {
      return await fn()
    }

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (error.code === 'EBUSY' && i < maxRetries - 1) {
          console.log(`
          * * * *
          Caught EBUSY and retrying

          function:
          `)
          console.log(fn)
          console.log(`
          * * * *
          `)
          await sleep(delayMS)
          continue
        }
        throw error
      }
    }
  }

  return {
    readdir: (path) => retryUntilSuccess(() => readdir(path)),

    readdirRecursive: (path) => retryUntilSuccess(
      () => readdir(path, { recursive: true, withFileTypes: true })
    ),

    readFile: (path, encoding = 'utf-8') => retryUntilSuccess(
      () => readFile(path, encoding)
    ),

    rm: (path, options = { recursive: true, force: true }) => retryUntilSuccess(
      () => rm(path, options)
    ),

    mkdir: (path, options = { recursive: true }) => retryUntilSuccess(
      () => mkdir(path, options)
    ),

    writeFile: (path, data, options = 'utf-8') => retryUntilSuccess(
      () => writeFile(path, data, options)
    )
  }
})()

module.exports = {
  atomicFS
}
