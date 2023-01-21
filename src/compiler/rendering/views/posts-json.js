const { join } = require('path')
const { writeFile } = require('fs/promises')
const Settings = require('../../../settings')
const { debugLog } = require('../../../debug')

const renderPostsJSON = ({ postsJSON }) => {
  const { out } = Settings.getSettings()
  const outPath = join(out, 'posts.json')
  debugLog('creating:', outPath)
  return writeFile(
    outPath,
    JSON.stringify(postsJSON, null, 2)
  )
}

module.exports = renderPostsJSON
