const { resolve } = require('path')
const NodeGit = require('nodegit')
const Debug = require('../debug')
const Settings = require('../settings')

const initRepo = async () => {
  const { rootDirectory } = Settings.getSettings()
  try {
    const repo = NodeGit.Repository.init(resolve(rootDirectory), 0)
    Debug.debugLog('git.initRepo')
    return repo
  } catch (initError) {
    Debug.debugLog('git.initRepo error', initError)
  }
}

const openRepo = async () => {
  const { rootDirectory } = Settings.getSettings()
  try {
    const repo = await NodeGit.Repository.open(resolve(rootDirectory))
    Debug.debugLog('git.openRepo')
    return repo
  } catch (openError) {
    return initRepo()
  }
}

const getDefaultConfig = async () => {
  const config = await NodeGit.Config.openDefault()
  Debug.debugLog('git.getDefaultConfig')
  return {
    name: (await config.getStringBuf('user.name')) || 'writ',
    email: (await config.getStringBuf('user.email')) || 'writ@example.com'
  }
}

const commitChanges = async (repo) => {
  if (!repo) {
    return Debug.debugLog('git.commitChanges no repo')
  }
  const changes = await repo.getStatus()
  if (!changes.length) {
    return Promise.resolve()
  }
  const index = await repo.refreshIndex()
  await Promise.all(
    changes.map(change => {
      if (change.status().includes('WT_DELETED')) {
        return index.removeAll([change.path()])
      }
      return index.addByPath(change.path())
    })
  )
  await index.write()

  const oid = await index.writeTree()
  const parentCommit = await repo.getHeadCommit()
  const defaultConfig = await getDefaultConfig()
  const author = NodeGit.Signature.now(defaultConfig.name, defaultConfig.email)
  const committer = NodeGit.Signature.now(defaultConfig.name, defaultConfig.email)
  const message = 'Check-in changes'
  const commitId = await repo.createCommit(
    "HEAD", author, committer, message, oid, parentCommit ? [parentCommit] : []
  )
  return commitId
}

const getEntry = (commit) => {
  const author = commit.author()
  return {
    hash: commit.sha(),
    author: {
      name: author.name(),
      email: author.email()
    },
    date: commit.date(),
    message: commit.message().trim()
  }
}

const getRevisionHistory = async (filePath) => {
  const { rootDirectory } = Settings.getSettings()
  const repo = await NodeGit.Repository.open(resolve(rootDirectory))
  const mostRecentCommit = await repo.getMasterCommit()
  const walker = repo.createRevWalk()
  walker.push(mostRecentCommit)
  walker.sorting(NodeGit.Revwalk.SORT.TIME)
  const historyEntries = await walker.fileHistoryWalk(filePath, 500)
  return historyEntries.map(history => getEntry(history.commit))
}

module.exports = {
  initRepo,
  openRepo,
  commitChanges,
  getRevisionHistory
}
