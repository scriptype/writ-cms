const fs = require('fs/promises')
const { join } = require('path')
const { tmpdir } = require('os')

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
const atomicReplace = async (targetPath, buildFn) => {
  const tempPath = await fs.mkdtemp(join(tmpdir(), 'atomic-replace-'))
  try {
    await buildFn(tempPath)
    await fs.rm(targetPath, { recursive: true, force: true })
    await fs.cp(tempPath, targetPath, { recursive: true })
  } catch (error) {
    await fs.rm(tempPath, { recursive: true, force: true })
    throw error
  }
}

module.exports = {
  readFileContent,
  loadJSON,
  isDirectory,
  ensureDirectory,
  atomicReplace
}
