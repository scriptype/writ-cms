const { resolve } = require('path')
const _ = require('lodash')
const bs = require('browser-sync').create()
const Settings = require('../settings')
const Debug = require('../debug')
const api = require('./api')

module.exports = {
  init({ decorators, onChange }) {
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
      console.log(new Date(), file)
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

    bs.watch(watchDir, watchOptions, cb)

    bs.init({
      server: serverDir,
      watch: false,
      ui: false,
      middleware: api.create(compilePromise, decorators.previewApi),
      notify: false
    })
  }
}
