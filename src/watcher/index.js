const bs = require('browser-sync').create()
const { resolve } = require('path')
const Settings = require('../settings')
const Debug = require('../debug')
const api = require('./api')

const watchOptions = {
  reloadDebounce: 500,
  ignoreInitial: true,
  ignored: new RegExp(
    [
      Settings.getSettings().exportDirectory,
      'node_modules',
      '.git',
      '.DS_Store',
      'package.json',
      'package-lock.json'
    ].join('|')
  )
}

Debug.debugLog('watch options', watchOptions)

module.exports = {
  init({ decorators, onChange }) {
    const { rootDirectory, exportDirectory } = Settings.getSettings()
    const watchDir = resolve(rootDirectory)
    const serverDir = resolve(rootDirectory, exportDirectory)

    Debug.debugLog('watch', watchDir)
    Debug.debugLog('serve', serverDir)

    let compilePromise = Promise.resolve()

    bs.watch(watchDir, watchOptions, (e, file) => {
      console.log(new Date(), file)
      compilePromise = compilePromise.then(onChange)
      bs.reload()
    })

    bs.init({
      server: serverDir,
      watch: true,
      ui: false,
      middleware: api.create(compilePromise, decorators.previewApi),
      notify: false
    })
  }
}
