const fs = require('fs/promises')
const { join } = require('path')
const { tmpdir, platform } = require('os')

const readFileContent = path => {
  return fs.readFile(path, { encoding: 'utf-8' })
}

const loadJSON = async (path) => {
  try {
    const exists = await fs.stat(path)
    return exists ? JSON.parse(await readFileContent(path)) : {}
  } catch {
    return {}
  }
}

const isDirectory = async (path) => {
  try {
    return (await fs.lstat(path)).isDirectory()
  }
  catch (ENOENT) {
    return false
  }
}

const ensureDirectory = async (path) => {
  try {
    await fs.mkdir(path, { recursive: true })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }
}

/*
 * Atomically replace a directory by building in isolation.
 * Solves Windows EBUSY errors from rm() immediately after cp().
 * Building in a separate temp location releases all file handles
 * before the final swap.
 */
const atomicReplace = async (targetPath, buildFn, sleepTime = 100) => {
  const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration))
  const tempPath = await atomicFS.mkdtemp(join(tmpdir(), 'atomic-replace-'))
  try {
    await buildFn(tempPath)
    await atomicFS.rm(targetPath)
    await sleep(sleepTime)
    await atomicFS.cp(tempPath, targetPath)
  } catch (error) {
    await atomicFS.rm(tempPath)
    throw error
  }
}

/*
 * Retry an operation when Windows file handles prevent immediate access.
 * On Windows, fs operations may fail with EBUSY if file handles aren't
 * released yet. This retries the operation with backoff until it succeeds,
 * mimicking the atomic pattern of building in isolation before swap.
 */
const atomicFS = (() => {
  const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration))

  const retryUntilSuccess = async (fn, maxRetries = 10, delayMS = 1000) => {
    if (platform() !== 'win32') {
      return fn()
    }

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (error.code === 'EBUSY' && i < maxRetries - 1) {
          console.log(`
          * * * *
          Caught EBUSY and retrying (${i}/${maxRetries})

          function:
          `)
          console.log(fn.toString())
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
    readdir: (path) => retryUntilSuccess(() => fs.readdir(path)),

    readdirRecursive: (path) => retryUntilSuccess(
      () => fs.readdir(path, { recursive: true, withFileTypes: true })
    ),

    readFile: (path, encoding = 'utf-8') => retryUntilSuccess(
      () => fs.readFile(path, encoding)
    ),

    rm: (path, options = { recursive: true, force: true }) => retryUntilSuccess(
      () => fs.rm(path, options)
    ),

    mkdir: (path, options = { recursive: true }) => retryUntilSuccess(
      () => fs.mkdir(path, options)
    ),

    writeFile: (path, data, options = 'utf-8') => retryUntilSuccess(
      () => fs.writeFile(path, data, options)
    ),

    stat: (path) => retryUntilSuccess(() => fs.stat(path)),

    cp: (src, dest, options = { recursive: true }) => retryUntilSuccess(
      () => fs.cp(src, dest, options)
    ),

    mkdtemp: (prefix) => retryUntilSuccess(() => fs.mkdtemp(prefix))
  }
})()

module.exports = {
  readFileContent,
  loadJSON,
  isDirectory,
  ensureDirectory,
  atomicReplace,
  atomicFS
}
