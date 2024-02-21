const { join } = require('path')
const { readFile, writeFile } = require('fs/promises')

const createSettingsModel = ({ getSettings }) => {
  const updateSettings = async (patch) => {
    const settingsJSONPath = join(getSettings().rootDirectory, 'settings.json')
    let settingsJSON = {}
    try {
      settingsJSON = JSON.parse(await readFile(settingsJSONPath))
    } catch { }

    const newSettingsJSON = {
      ...settingsJSON,
      ...patch
    }

    await writeFile(settingsJSONPath, JSON.stringify(newSettingsJSON, null, 2))

    return newSettingsJSON
  }

  return {
    get: getSettings,
    update: updateSettings
  }
}

module.exports = createSettingsModel
