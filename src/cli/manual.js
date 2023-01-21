const { version: vn } = require('../../package.json')

module.exports = `
  writ (v${vn})
  =============

  Interface:
  $ writ [start|build] [dir=.] [--debug]

  Start local development:
  $ writ start

  Produce a build output:
  $ writ build

  Use a different source directory:
  $ writ <start|build> ../the-other-directory

  Start local development in debug mode:
  $ writ start --debug

  Start local development in debug mode in different source directory:
  $ writ start ../the-other-directory --debug

  Produce a build in debug mode:
  $ writ build --debug
`
