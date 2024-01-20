const { rm, mkdtemp, mkdir, readdir, writeFile } = require('fs/promises')
const { tmpdir } = require('os')
const { join, resolve } = require('path')
const test = require('tape')
const writ = require('..')

const createTempDir = async () => {
  const dirName = await mkdtemp(join(tmpdir(), 'writ-test-'))
  return {
    name: dirName,
    mkFile: (name, content) => writeFile(join(dirName, name), content),
    mkAsset: (assetsDirectory, name, content) => writeFile(join(dirName, assetsDirectory, name), content),
    mkDir: (name) => mkdir(join(dirName, name), { recursive: true }),
    rm: () => rm(dirName, { recursive: true })
  }
}

const hasExportDirectory = (t, paths, message) => {
  const { exportDirectory } = writ.getDefaultSettings()
  t.true(paths.includes(exportDirectory), message)
}

const hasThemeDirectory = (t, paths, message) => {
  const { themeDirectory } = writ.getDefaultSettings()
  t.true(paths.includes(themeDirectory), message)
}

const hasAssetsDirectory = (t, paths, message) => {
  const { assetsDirectory } = writ.getDefaultSettings()
  t.true(paths.includes(assetsDirectory), message)
}

const hasCommonDirectory = (t, paths, message) => {
  t.true(paths.includes('common'), message)
}

const hasDefaultThemeDirectory = (t, paths, message) => {
  t.true(paths.includes('default'), message)
}

const hasCustomDirectory = (t, paths, message) => {
  t.true(paths.includes('custom'), message)
}

const hasTemplatesDirectory = (t, paths, message) => {
  t.true(paths.includes('templates'), message)
}

const hasPaths = (t, actualPaths, expectedPaths, message, messagePrefix) => {
  const prefix = messagePrefix ? (messagePrefix + ' ') : ''
  const postfix = messagePrefix ? '' : ' exist(s)'
  t.true(
    expectedPaths.every(p => actualPaths.includes(p)),
    message || `${prefix}${expectedPaths.join(', ')}${postfix}`
  )
}

const hasNotPaths = (t, actualPaths, unexpectedPaths, message, messagePrefix) => {
  const prefix = messagePrefix ? (messagePrefix + ' ') : ''
  const postfix = messagePrefix ? '' : ' do not exist(s)'
  t.false(
    unexpectedPaths.some(p => actualPaths.includes(p)),
    message || `${prefix}${unexpectedPaths.join(', ')}${postfix}`
  )
}

const expectPaths = (t, actualPaths, expectedPaths, scope) => {
  if (expectedPaths) {
    if (expectedPaths.exists) {
      let prefix = scope ? `${scope} has` : undefined
      hasPaths(t, actualPaths, expectedPaths.exists, '', prefix)
    }
    if (expectedPaths.notExists) {
      let prefix = scope ? `${scope} does not have` : undefined
      hasNotPaths(t, actualPaths, expectedPaths.notExists, '', prefix)
    }
  }
}

const common = {
  rootDirectoryContents(t, actualPaths, expectedPaths) {
    hasExportDirectory(t, actualPaths, 'Creates export directory')
    hasThemeDirectory(t, actualPaths, 'Creates theme directory')
    expectPaths(t, actualPaths, expectedPaths, 'Root directory')
  },

  exportDirectoryContents(t, actualPaths, expectedPaths) {
    hasAssetsDirectory(t, actualPaths, 'Export directory has assets directory')
    hasPaths(t, actualPaths, ['index.html'], 'Export directory has index.html')
    expectPaths(t, actualPaths, expectedPaths, 'Export directory')
  },

  exportAssetsDirectoryContents(t, actualPaths, expectedPaths) {
    if (!expectedPaths) {
      hasDefaultThemeDirectory(t, actualPaths, 'Export/assets directory has theme-default assets')
      hasCustomDirectory(t, actualPaths, 'Export/assets directory has custom assets')
    }
    expectPaths(t, actualPaths, expectedPaths, 'Export/assets directory')
  },

  themeDirectoryContents(t, actualPaths, expectedPaths) {
    if (!expectedPaths) {
      hasAssetsDirectory(t, actualPaths, 'Theme directory has assets directory')
      hasTemplatesDirectory(t, actualPaths, 'Theme directory has templates directory')
      hasPaths(t, actualPaths, ['style.css', 'script.js'], 'Theme directory has style.css and script.js')
    }
    expectPaths(t, actualPaths, expectedPaths, 'Theme directory')
  },

  async builds(t, rootDirectory, expectedPaths = {}) {
    const {
      exportDirectory,
      assetsDirectory,
      themeDirectory
    } = writ.getDefaultSettings()
    const {
      rootDirectoryPaths,
      exportDirectoryPaths,
      assetsDirectoryPaths,
      themeDirectoryPaths
    } = expectedPaths
    common.rootDirectoryContents(t, await readdir(rootDirectory), rootDirectoryPaths)
    common.exportDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory)), exportDirectoryPaths)
    common.exportAssetsDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory, assetsDirectory)), assetsDirectoryPaths)
    common.themeDirectoryContents(t, await readdir(join(rootDirectory, themeDirectory)), themeDirectoryPaths)
  }
}

test('builds in empty directory', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name)
})

test('builds with a single txt file', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [fileNameIn]
    },
    exportDirectoryPaths: {
      exists: [fileNameOut]
    }
  })
})

test('builds after a file is deleted', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  await writ.build({
    rootDirectory: dir.name
  })

  await rm(join(dir.name, fileNameIn))

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      notExists: [fileNameIn]
    },
    exportDirectoryPaths: {
      notExists: [fileNameOut]
    }
  })
})

test('builds after theme folder is deleted', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory } = writ.getDefaultSettings()
  await rm(join(dir.name, themeDirectory), { recursive: true })

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name)
})

test('builds after theme/assets folder is deleted', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory, assetsDirectory } = writ.getDefaultSettings()
  await rm(join(dir.name, themeDirectory, assetsDirectory), { recursive: true })

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    assetsDirectoryPaths: {
      exists: ['custom'],
      notExists: ['default']
    },
    themeDirectoryPaths: {
      exists: ['templates', 'style.css', 'script.js'],
      notExists: [assetsDirectory]
    }
  })
})

test('builds after theme/templates folder is deleted', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory } = writ.getDefaultSettings()
  await rm(join(dir.name, themeDirectory, 'templates'), { recursive: true })

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    themeDirectoryPaths: {
      exists: ['assets', 'style.css', 'script.js'],
      notExists: ['templates']
    }
  })
})

test('creates tag indices', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      notExists: ['tag']
    }
  })

  const tags = ['test-tag', 'test-tag-2']
  const frontMatter = `---\n` +
    `tags: ${tags.join(', ')}\n` +
    `---\n`

  await dir.mkFile(fileNameIn, `${frontMatter}Hello!`)

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      exists: ['tag']
    }
  })

  const { exportDirectory } = writ.getDefaultSettings()
  const tagDirectoryContents = await readdir(join(dir.name, exportDirectory, 'tag'))
  t.true(
    tags.every(tag => tagDirectoryContents.includes(tag)),
    'Creates tag indices'
  )

  t.true(
    tagDirectoryContents.includes('index.html'),
    'Creates bare tag page'
  )

  const tagIndexFolders = await Promise.all(
    tagDirectoryContents
      .filter(tagIndex => tagIndex !== 'index.html')
      .map(tagIndex => readdir(join(dir.name, exportDirectory, 'tag', tagIndex)))
  )

  t.true(
    tagIndexFolders.every(folder => folder.includes('index.html')),
    'Tag indices are folders with index.html'
  )
})

test('allows uncategorized foldered post', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const postName = 'test-post'
  const localAssetName = 'asset.jpg'
  const subFolderName = 'some folder'
  const subFolderAsset = 'note.txt'
  await dir.mkDir(postName)
  await dir.mkFile(join(postName, 'post.md'), 'a post')
  await dir.mkFile(join(postName, localAssetName), '')
  await dir.mkDir(join(postName, subFolderName))
  await dir.mkFile(join(postName, subFolderName, subFolderAsset), 'an asset inside subfolder')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      exists: [postName]
    }
  })

  const { exportDirectory } = writ.getDefaultSettings()
  const compiledPostFolder = await readdir(join(dir.name, exportDirectory, postName))
  hasPaths(t, compiledPostFolder, ['index.html', localAssetName, subFolderName], 'Compiled root post folder has index.html and local assets')

  const subFolder = await readdir(join(dir.name, exportDirectory, postName, subFolderName))
  hasPaths(t, subFolder, [subFolderAsset], 'Subfolder inside foldered post is passed-through')
})

test('builds when contentDirectory exists', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const { contentDirectory } = writ.getDefaultSettings()
  await dir.mkDir(contentDirectory)

  const uncategorizedPostFile = 'uncategorized-post-name.txt'
  const uncategorizedPostFileOut = 'uncategorized-post-name.html'
  await dir.mkFile(join(contentDirectory, uncategorizedPostFileOut), 'Hello!')

  const uncategorizedFolderedPost = 'a new post'
  const uncategorizedFolderedPostOut = 'a-new-post'
  await dir.mkDir(join(contentDirectory, uncategorizedFolderedPost))
  await dir.mkFile(join(contentDirectory, uncategorizedFolderedPost, 'post.md'), 'A new post')

  const rootAsset = 'asset-in-root.jpg'
  await dir.mkFile(rootAsset, '')

  const rootAssetInContent = 'asset-in-content-folder.jpg'
  await dir.mkFile(join(contentDirectory, rootAssetInContent), '')

  const categoryName = 'test-category'
  const categorizedPostName = 'test-post'
  const categorizedPostLocalAsset = 'post-local-asset.jpg'
  await dir.mkDir(join(contentDirectory, categoryName, categorizedPostName))
  await Promise.all([
    dir.mkFile(join(contentDirectory, categoryName, categorizedPostName, 'post.md'), 'My test post'),
    dir.mkFile(join(contentDirectory, categoryName, categorizedPostName, categorizedPostLocalAsset), ''),
  ])

  await writ.build({
    rootDirectory: dir.name
  })

  const { exportDirectory } = writ.getDefaultSettings()

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [contentDirectory, rootAsset]
    },
    exportDirectoryPaths: {
      notExists: [contentDirectory, rootAsset],
      exists: [uncategorizedPostFileOut, uncategorizedFolderedPostOut, rootAssetInContent]
    }
  })

  const categorizedPostFolder = await readdir(join(dir.name, exportDirectory, categoryName, categorizedPostName))
  hasPaths(t, categorizedPostFolder, ['index.html', categorizedPostLocalAsset], 'Compiled test post folder has index.html and local asset')

  const uncategorizedFolderedPostFolder = await readdir(join(dir.name, exportDirectory, uncategorizedFolderedPostOut))
  hasPaths(t, uncategorizedFolderedPostFolder, ['index.html'], 'Compiled uncategorized foldered post folder has index.html')
})

test('passes through assets folder', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const { assetsDirectory } = writ.getDefaultSettings()
  await dir.mkDir(assetsDirectory)
  const fileName = 'hey-asset.jpg'
  await dir.mkAsset(assetsDirectory, fileName, '')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    assetsDirectoryPaths: {
      exists: [fileName]
    }
  })
})
