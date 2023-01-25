const bs = require('browser-sync').create()
const { resolve } = require('path')
const writ = require('../')
const settings = require('../settings')
const Debug = require('../debug')
const api = require('./api')

const watchOptions = {
  reloadDebounce: 500,
  ignoreInitial: true,
  ignored: new RegExp(
    [
      settings.getSettings().exportDirectory,
      'node_modules',
      '.git',
      '.DS_Store',
      'package.json',
      'package-lock.json'
    ].join('|')
  )
}

module.exports = {
  init() {
    const { rootDirectory, exportDirectory } = settings.getSettings()
    const watchDir = resolve(rootDirectory)
    const serverDir = resolve(rootDirectory, exportDirectory)

    Debug.debugLog('watch', watchDir)
    Debug.debugLog('serve', serverDir)

    let compilePromise = writ.start({
      rootDirectory,
      watch: false,
      debug: Debug.getDebug()
    })

    bs.watch(watchDir, watchOptions, (e, file) => {
      console.log(new Date(), file)
      compilePromise = compilePromise.then(() => {
        return writ.start({
          rootDirectory,
          watch: false,
          debug: Debug.getDebug()
        })
      })
      bs.reload()
    })

    bs.init({
      server: serverDir,
      watch: true,
      ui: false,
      middleware: api.create(compilePromise, settings),
      notify: false
    })
  }
}