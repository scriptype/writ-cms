const { cp, stat, writeFile } = require('fs/promises')
const { join } = require('path')
const Settings = require('./settings')

const create = async () => {
  const { rootDirectory, cname, out } = Settings.getSettings()

  const dest = join(out, 'CNAME')
  if (cname) {
    return writeFile(dest, cname)
  }

  const src = join(rootDirectory, 'CNAME')
  try {
    if (await stat(src)) {
      return cp(src, dest)
    }
  } catch {}

  return Promise.resolve()
}

module.exports = {
  create
}
