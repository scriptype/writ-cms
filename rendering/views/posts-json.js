const { join } = require('path')
const { writeFile } = require('fs/promises')
const { out } = require('../../settings').getSettings()
const { debugLog } = require('../../helpers')

const renderPostsJSON = ({ postsJSON }) => {
  const outPath = join(out, 'posts.json')
  debugLog('creating:', outPath)
  return writeFile(
    outPath,
    JSON.stringify(postsJSON, null, 2)
  )
}

module.exports = renderPostsJSON
