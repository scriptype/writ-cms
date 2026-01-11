const os = require('os')
const test = require('tape')
const ContentModel2 = require('../../compiler/contentModel')

const FSTree = os.platform() === 'win32' ?
  require('../fixtures/contentModel2FSTreeWin32.json') :
  require('../fixtures/contentModel2FSTree.json')

test('compiler/contentModel2', t => {
  t.test('exits 0', async () => {
    const contentModel2 = new ContentModel2({
      permalinkPrefix: '/my/crazy/url/schemes/',
      out: '/somewhere/out/there/there/is/gotta/be/a',
      defaultCategoryName: 'Unclassified',
      assetsDirectory: 'azkaban',
      pagesDirectory: 'stufflar',
      homepageDirectory: 'prelude'
    })
    console.dir(
      contentModel2.create(FSTree).collections[0],
      { depth: null, colors: true }
    )
  })
})
