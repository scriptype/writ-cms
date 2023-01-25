const util = require('util')
const exec = util.promisify(require('node:child_process').exec)

const logExecError = (cmd, error) => {
  console.log(`${cmd} failed with error:`, error)
}

const gitClient = {
  async has() {
    try {
      const { stderr } = await exec('git status')
      return !stderr
    } catch (err) {
      logExecError('git status', err)
      return false
    }
  },

  async init() {
    try {
      const { stderr } = await exec('git init')
      return !stderr
    } catch (err) {
      logExecError('git init', err)
      return false
    }
  },

  async stageFiles(files) {
    try {
      files.forEach(async filePath => {
        await exec(`git add ${filePath}`)
      })
      return true
    } catch (err) {
      logExecError('git add', err)
    }
  },

  async commit(message) {
    try {
      const { stderr } = await exec(`git commit -m ${message}`)
      return !stderr
    } catch (err) {
      logExecError('git commit', err)
      return false
    }
  }
}

module.exports = gitClient