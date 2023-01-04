const bs = require('browser-sync').create()
const _ = require('lodash')
const { execSync } = require('child_process')
const writ = require('../')
const createServer = require('./server/create')

module.exports = (settings) => {
  const watchOptions = {
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

  bs.watch('.', watchOptions, _.debounce((e, file) => {
    console.log('Changed:', file)
    compilePromise = compilePromise.then(() => writ(settings).compile())
    bs.reload()
  }, 100));

  bs.init({
    server: settings.exportDirectory,
    watch: true,
    ui: false,
    middleware: createServer(compilePromise, settings)
  });
}
