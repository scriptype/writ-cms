const { tmpdir } = require('os')
const { rm, mkdtemp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const test = require('tape')
const { contentRoot } = require('../helpers')

const tempDir = () => {
  return mkdtemp(join(tmpdir(), 'writ-test-'))
}

test('helpers', t => {
  t.test('contentRoot', async () => {
    try {
      await contentRoot()
      t.fail('if rootDirectory parameter is missing, throws exception')
    } catch (e) {
      t.pass('if rootDirectory parameter is missing, throws exception')
    }

    const dir1 = await tempDir()
    t.teardown(() => {
      rm(dir1, { recursive: true })
    })
    const actual1 = await contentRoot(resolve(dir1))
    const expected1 = resolve(dir1)
    t.equal(
      actual1,
      expected1,
      'if contentDirectory parameter is missing, contentRootPath is rootDirectory'
    )

    const dir2 = await tempDir()
    t.teardown(() => {
      rm(dir2, { recursive: true })
    })
    const actual2 = await contentRoot(resolve(dir2), 'content')
    const expected2 = resolve(dir2)
    t.equal(
      actual2,
      expected2,
      'if contentDirectory is not found, contentRootPath is rootDirectory'
    )

    const dir3 = await tempDir()
    await mkdir(join(dir3, 'content'))
    t.teardown(() => {
      rm(dir3, { recursive: true })
    })
    const actual3 = await contentRoot(resolve(dir3), 'content')
    const expected3 = resolve(dir3, 'content')
    t.equal(
      actual3,
      expected3,
      'if contentDirectory is found contentRootPath is contentDirectory'
    )
  })
})
