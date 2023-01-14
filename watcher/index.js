const bs = require('browser-sync').create()
const { resolve } = require('path')
const writ = require('../')
const settings = require('../settings').getSettings()
const createServer = require('./server/create')
const { debugLog } = require('../helpers')

const watchOptions = {
  reloadDebounce: 500,
  ignoreInitial: true,
  ignored: new RegExp(
    [
      settings.exportDirectory,
      'node_modules',
      '.git',
      '.DS_Store',
      'package.json',
      'package-lock.json',
      'settings.json'
    ].join('|')
  )
}

const { rootDirectory, exportDirectory, debug } = settings
const watchDir = resolve(rootDirectory)
const serverDir = resolve(rootDirectory, exportDirectory)

debugLog('watch', watchDir)
debugLog('serve', serverDir)

let compilePromise = writ.start({
  rootDirectory,
  watch: false,
  debug
})

bs.watch(watchDir, watchOptions, (e, file) => {
  console.log(new Date(), file)
  compilePromise = compilePromise.then(() => {
    return writ.start({
      rootDirectory,
      watch: false,
      debug,
    })
  })
  bs.reload()
});

bs.init({
  server: serverDir,
  watch: true,
  ui: false,
  middleware: createServer(compilePromise, settings)
});
