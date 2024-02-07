const { tmpdir } = require('os')
const { rm, mkdtemp, mkdir, readdir, readFile, writeFile } = require('fs/promises')
const { resolve, join } = require('path')
const test = require('tape')
const { contentRoot } = require('../../compiler/fileSystem')

const tempDir = () => {
  return mkdtemp(join(tmpdir(), 'writ-test-'))
}

test('compiler/fileSystem', t => {
  t.test('contentRoot', st => {
    st.test('if rootDirectory parameter is missing', async () => {
      const dir = await tempDir()
      t.teardown(() => {
        rm(dir, { recursive: true })
      })
      const actual = await contentRoot()
      t.notOk(actual, 'contentRoot is undefined')
    })

    st.test('if contentDirectory parameter is missing', async () => {
      const dir = await tempDir()
      t.teardown(() => {
        rm(dir, { recursive: true })
      })
      const actual = await contentRoot(resolve(dir))
      const expected = resolve(dir)
      t.equal(actual, expected, 'contentRoot is rootDirectory')
    })

    st.test('if contentDirectory is not found', async () => {
      const dir = await tempDir()
      t.teardown(() => {
        rm(dir, { recursive: true })
      })
      const actual = await contentRoot(resolve(dir), 'content')
      const expected = resolve(dir)
      t.equal(actual, expected, 'contentRoot is rootDirectory')
    })

    st.test('if contentDirectory is found', async () => {
      const dir = await tempDir()
      await mkdir(join(dir, 'content'))
      t.teardown(() => {
        rm(dir, { recursive: true })
      })
      const actual = await contentRoot(resolve(dir), 'content')
      const expected = resolve(dir, 'content')
      t.equal(actual, expected, 'contentRoot is contentDirectory')
    })
  })
})
