const os = require('os')
const test = require('tape')
const contentModel2 = require('../../compiler/contentModel2')

const FSTree = os.platform() === 'win32' ?
  require('../fixtures/contentModel2FSTreeWin32.json') :
  require('../fixtures/contentModel2FSTree.json')

test('compiler/contentModel2', t => {
  t.test('exits 0', async () => {
    console.log(
      contentModel2.create(FSTree).collections[0]
    )
  })
})
