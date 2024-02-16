const api = require('../cms/api')
const Settings = require('../settings')

module.exports = {
  ...api.fileSystemExplorer,
  exploreTree() {
    const {
      rootDirectory,
      contentDirectory,
      IGNORE_PATHS_REG_EXP: ignorePattern
    } = Settings.getSettings()

    const explorer = api.fileSystemExplorer({
      rootDirectory,
      contentDirectory,
      ignorePattern
    })

    return explorer.exploreTree()
  }
}
