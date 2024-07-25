const { join } = require('path')
const { writeFile } = require('fs/promises')
const Settings = require('../../../settings')
const { getDebug, debugLog } = require('../../../debug')

const renderPostsJSON = ({ posts, categories }) => {
  if (!posts || !posts.length) {
    debugLog('no posts, skipping posts.json')
    return Promise.resolve()
  }
  const { out } = Settings.getSettings()
  const outPath = join(out, 'posts.json')
  debugLog('creating:', outPath)
  const postsJSON = posts.map(({ content, outputPath, ...rest }) => rest)
  const writes = [
    writeFile(
      outPath,
      JSON.stringify(postsJSON, null, 2)
    )
  ]
  if (getDebug()) {
    const outPath2 = join(out, 'categories.json')
    debugLog('creating:', outPath2)
    writes.push(writeFile(
      outPath2,
      JSON.stringify(categories, null, 2)
    ))
  }
  return Promise.all(writes)
}

module.exports = renderPostsJSON
