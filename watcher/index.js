const bs = require('browser-sync').create()
const { resolve } = require('path')
const writ = require('../')
const createServer = require('./server/create')

module.exports = (settings) => {
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
        '_scripts'
      ].join('|')
    )
  }

  let compilePromise = writ(settings).compile()

  const rootDirectory = settings.rootDirectory || '.'
  const exportDirectory = settings.exportDirectory || 'site'
  const watchDir = resolve(rootDirectory || '.')
  const serverDir = resolve(rootDirectory, exportDirectory)

  console.log('watch', watchDir)
  console.log('serve', serverDir)

  bs.watch(watchDir, watchOptions, (e, file) => {
    console.log('Changed:', file)
    compilePromise = compilePromise.then(() => writ(settings).compile())
    bs.reload()
  });

  bs.init({
    server: serverDir,
    watch: true,
    ui: false,
    middleware: createServer(compilePromise, settings)
  });
}
