const { rm, mkdir, readdir } = require('fs/promises')
const { join, resolve } = require('path')
const test = require('ava')
const writ = require('..')

const randomNumber = () => {
  return String(Date.now() * Math.random()).split('.')[0]
}

const createTempDir = async () => {
  const dirName = resolve(join(__dirname, '/test-dir' + randomNumber()))
  await mkdir(dirName)
  return {
    name: dirName,
    rm: () => rm(dirName, { recursive: true })
  }
}

test('builds in empty directory', async t => {
  const dir = await createTempDir()

  const { exportDirectory, assetsDirectory } = writ.getDefaultSettings()
  await writ.build({
    rootDirectory: dir.name
  })

  const dirContents = await readdir(dir.name)
  t.deepEqual(dirContents, [exportDirectory], 'Creates exportDirectory')

  const exportDirectoryContents = await readdir(join(dir.name, exportDirectory))
  t.true(
    exportDirectoryContents.includes('index.html'),
    'Export directory has index.html'
  )
  t.true(
    exportDirectoryContents.includes(assetsDirectory),
    'Export directory has assets directory'
  )

  const assetsDirectoryContents = await readdir(join(dir.name, exportDirectory, assetsDirectory))
  t.true(
    assetsDirectoryContents.includes('common'),
    'Assets directory has common assets'
  )
  t.true(
    assetsDirectoryContents.includes('default'),
    'Assets directory has theme-default assets'
  )
  await dir.rm(dir.name)
})
