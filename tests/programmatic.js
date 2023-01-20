const writ = require('../')
const ContentEditor = require('../packages/expansion-content-editor')

writ
  .use(ContentEditor('start'))
  .start({
    rootDirectory: '/Users/enes/code/writ',
    debug: true
  })
