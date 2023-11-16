const { resolve } = require('path')
const fs = require('fs')
const git = require('isomorphic-git')
const Debug = require('../debug')
const Settings = require('../settings')

const getRepoPath = () => {
  const { rootDirectory } = Settings.getSettings()
  return resolve(rootDirectory)
}

const openRepo = async () => {
  try {
    await git.init({ fs, dir: getRepoPath() })
    Debug.debugLog('git.init')
  } catch (initError) {
    Debug.debugLog('git.init error', initError)
  }
}

const getConfig = async () => {
  const name = await git.getConfig({
    fs,
    dir: getRepoPath(),
    path: 'user.name'
  })
  const email = await git.getConfig({
    fs,
    dir: getRepoPath(),
    path: 'user.email'
  })
  Debug.debugLog('git.getDefaultConfig')
  return {
    name: name || 'writ',
    email: email || 'writ@example.com'
  }
}

const FILE = 0, HEAD = 1, WORKDIR = 2, STAGE = 3
const isDeleted = row => row[WORKDIR] === 0
const isChange = row => row[HEAD] !== 1 || row[WORKDIR] !== 1 || row[STAGE] !== 1

const commitChanges = async () => {
  const statusMatrix = await git.statusMatrix({
    fs,
    dir: getRepoPath(),
    cache: {}
  })
  const changes = statusMatrix.filter(isChange)
  if (!changes.length) {
    return Promise.resolve()
  }
  await Promise.all(
    changes.map(change => {
      if (isDeleted(change)) {
        return git.remove({ fs, dir: getRepoPath(), filepath: change[FILE] })
      }
      return git.add({ fs, dir: getRepoPath(), filepath: change[FILE] })
    })
  )

  const author = await getConfig()
  const message = 'Check-in changes'
  const commitId = await git.commit({
    fs,
    dir: getRepoPath(),
    author,
    message
  })
  return commitId
}

const getRevision = ({ oid, commit }) => {
  const author = commit.author
  // timezoneOffset: -120
  const date = new Date(author.timestamp * 1000)
  return {
    hash: oid,
    author: {
      name: author.name,
      email: author.email
    },
    date,
    message: commit.message
  }
}

const getRevisionHistory = async (filePath) => {
  const entries = git.log({
    fs,
    dir: getRepoPath(),
    filepath: filePath
  })
  return entries.map(getRevision)
}

module.exports = {
  openRepo,
  commitChanges,
  getRevisionHistory
}
