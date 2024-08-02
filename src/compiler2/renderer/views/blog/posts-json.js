const { join } = require('path')
const { writeFile } = require('fs/promises')
const Settings = require('../../../../settings')
const { getDebug, debugLog } = require('../../../../debug')
const { ensureDirectory } = require('../../../../helpers')

const renderPostsJSON = ({ posts, categories, outputPrefix }) => {
  if (!posts || !posts.length) {
    debugLog('no posts, skipping posts.json')
    return Promise.resolve()
  }
  const { out } = Settings.getSettings()
  const outPath = join(out, outputPrefix, 'posts.json')
  debugLog('creating:', outPath)
  const postsJSON = posts.map(({ content, outputPath, ...rest }) => rest)
  return ensureDirectory(join(out, outputPrefix))
    .then(() =>
      writeFile(
        outPath,
        JSON.stringify(postsJSON, null, 2)
      ).catch(e => console.error('error writing postsJSON', e))
    )
}

module.exports = renderPostsJSON
