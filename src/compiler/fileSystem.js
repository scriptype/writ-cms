const api = require('../cms/api')
const Settings = require('../settings')

module.exports = {
  ...api.fileSystem,
  exploreTree() {
    const { rootDirectory, contentDirectory } = Settings.getSettings()
    return api.fileSystem.exploreTree({
      rootDirectory,
      contentDirectory
    })
  }
}
