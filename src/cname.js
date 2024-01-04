const { join } = require('path')
const { stat, readdir, writeFile } = require('fs/promises')
const Settings = require('./settings')

const createCNAME = () => {
  const { out, domain } = Settings.getSettings()
  if (!domain) {
    return Promise.resolve()
  }
  return writeFile(join(out, 'CNAME'), domain)
}

module.exports = {
  create: createCNAME
}
