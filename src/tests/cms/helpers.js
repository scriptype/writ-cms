const { tmpdir } = require('os')
const { rm, mkdtemp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const test = require('tape')
const { contentRootPath, lookBack } = require('../../cms/api/helpers')

const tempDir = () => {
  return mkdtemp(join(tmpdir(), 'writ-test-'))
}

test('cms/helpers', t => {
  t.test('contentRootPath', async () => {
    try {
      await contentRootPath()
      t.fail('if rootDirectory parameter is missing, throws exception')
    } catch (e) {
      t.pass('if rootDirectory parameter is missing, throws exception')
    }

    const dir1 = await tempDir()
    t.teardown(() => {
      rm(dir1, { recursive: true })
    })
    const actual1 = await contentRootPath(resolve(dir1))
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
    const actual2 = await contentRootPath(resolve(dir2), 'content')
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
    const actual3 = await contentRootPath(resolve(dir3), 'content')
    const expected3 = resolve(dir3, 'content')
    t.equal(
      actual3,
      expected3,
      'if contentDirectory is found contentRootPath is contentDirectory'
    )
  })

  t.test('lookBack', async () => {
    const path = join('lorem', 'ipsum', 'dolor', 'sit')
    t.equal(
      lookBack(path, 1),
      resolve(join('lorem', 'ipsum', 'dolor')),
      'resolves parent path at given traverse distance'
    )

    t.equal(
      lookBack(path, 2),
      resolve(join('lorem', 'ipsum')),
      'resolves parent path at given traverse distance'
    )

    t.equal(
      lookBack(path, 3),
      resolve('lorem'),
      'resolves parent path at given traverse distance'
    )

    t.equal(
      lookBack(path),
      resolve(join('lorem', 'ipsum', 'dolor')),
      'if depth parameter is missing, looks back just one level'
    )

    t.throws(lookBack, 'if path parameter is missing, throws exception')
  })
})
