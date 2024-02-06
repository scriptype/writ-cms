const { resolve } = require('path')
const _ = require('lodash')
const bs = require('browser-sync').create()
const Settings = require('../settings')
const Debug = require('../debug')
const api = require('./api')

module.exports = {
  init({ onChange, silent }) {
    const { rootDirectory, exportDirectory } = Settings.getSettings()
    const watchDir = resolve(rootDirectory)
    const serverDir = resolve(rootDirectory, exportDirectory)
    const watchOptions = {
      ignoreInitial: true,
      ignored: new RegExp(
        [
          exportDirectory,
          'node_modules',
          '.git',
          '.DS_Store',
          'package.json',
          'package-lock.json'
        ].join('|')
      )
    }

    Debug.debugLog('watch options', watchOptions)
    Debug.debugLog('watch', watchDir)
    Debug.debugLog('serve', serverDir)

    let compilePromise = Promise.resolve()

    const cb = _.debounce((e, file) => {
      if (!silent) {
        console.log(new Date(), file)
      }
      compilePromise = compilePromise
        .then(onChange)
        .then(() => {
          bs.reload()
          if (cb.cancel) {
            cb.cancel()
          }
          return Promise.resolve()
        })
    }, 2000, { leading: true })

    const watcher = bs.watch(watchDir, watchOptions, cb)

    return new Promise(resolve => {
      bs.init({
        server: serverDir,
        watch: false,
        ui: false,
        middleware: api.create(compilePromise),
        notify: false,
        open: false,
        logLevel: silent ? 'silent' : 'info'
      }, () => {
        resolve({
          stop() {
            bs.exit()
            watcher.close()
          }
        })
      })
    })
  }
}
