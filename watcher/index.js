const bs = require('browser-sync').create()
const { resolve } = require('path')
const writ = require('../')
const settings = require('../settings').getSettings()
const createServer = require('./server/create')

const watchOptions = {
  reloadDebounce: 100,
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

const { rootDirectory, exportDirectory } = settings
const watchDir = resolve(rootDirectory)
const serverDir = resolve(rootDirectory, exportDirectory)

console.log('watch', watchDir)
console.log('serve', serverDir)

let compilePromise = writ.start(rootDirectory, {
  watch: false
})

bs.watch(watchDir, watchOptions, (e, file) => {
  console.log('Changed:', file)
  compilePromise = compilePromise.then(() => writ.start(rootDirectory, { watch: false }))
  bs.reload()
});

bs.init({
  server: serverDir,
  watch: true,
  ui: false,
  middleware: createServer(compilePromise, settings)
});
