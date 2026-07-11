const test = require('tape')
const fs = require('fs/promises')
const os = require('os')
const path = require('path')
const {
  contentRootPath,
  readFileContent,
  omitResolvedLinks,
  replaceFilename,
  getRelativePath,
  validatePath,
  deleteAttachments,
  uploadAttachments
} = require('./helpers')

const createTemporaryDirectory = () => {
  return fs.mkdtemp(path.join(os.tmpdir(), 'writ-cms-'))
}

test('contentRootPath requires a root directory', async (t) => {
  try {
    await contentRootPath()
    t.fail('should have thrown an error')
  } catch (error) {
    t.equal(
      error.message,
      'rootDirectory is a required parameter',
      'rejects missing root directory'
    )
  }
})

test('contentRootPath uses an existing content directory', async (t) => {
  const rootDirectory = await createTemporaryDirectory()
  const contentDirectory = 'content'
  const expectedPath = path.join(rootDirectory, contentDirectory)

  await fs.mkdir(expectedPath)

  const rootPath = await contentRootPath(rootDirectory, contentDirectory)

  t.equal(rootPath, expectedPath, 'returns the content directory path')

  await fs.rm(rootDirectory, { recursive: true })
})

test('contentRootPath falls back to the root directory', async (t) => {
  const rootDirectory = await createTemporaryDirectory()

  const rootPath = await contentRootPath(rootDirectory, 'missing-content')

  t.equal(rootPath, rootDirectory, 'returns the root directory')

  await fs.rm(rootDirectory, { recursive: true })
})

test('readFileContent reads UTF-8 file content', async (t) => {
  const directory = await createTemporaryDirectory()
  const filePath = path.join(directory, 'entry.txt')

  await fs.writeFile(filePath, 'Hello, world!')

  const content = await readFileContent(filePath)

  t.equal(content, 'Hello, world!', 'returns the file content')

  await fs.rm(directory, { recursive: true })
})

test('omitResolvedLinks removes resolved links recursively', (t) => {
  const source = {
    links: ['root-link'],
    child: {
      __links: ['child-link'],
      value: 'kept'
    },
    entries: [{ links: ['entry-link'], title: 'Entry' }]
  }

  const result = omitResolvedLinks(source)

  t.deepEqual(
    result,
    {
      child: { value: 'kept' },
      entries: [{ title: 'Entry' }]
    },
    'removes both link property names at every depth'
  )

  t.end()
})

test('omitResolvedLinks does not mutate its source object', (t) => {
  const source = {
    child: {
      __links: ['child-link'],
      value: 'kept'
    }
  }

  omitResolvedLinks(source)

  t.deepEqual(
    source,
    {
      child: {
        __links: ['child-link'],
        value: 'kept'
      }
    },
    'leaves resolved links on the source object'
  )

  t.end()
})

test('replaceFilename retains the directory and replaces the basename', (t) => {
  const result = replaceFilename(
    path.join('content', 'old-name.md'),
    path.join('unrelated', 'new-name.md')
  )

  t.equal(
    result,
    path.join('content', 'new-name.md'),
    'uses the old path directory and new path basename'
  )

  t.end()
})

test('getRelativePath resolves paths from the content root', async (t) => {
  const rootDirectory = await createTemporaryDirectory()
  const contentDirectory = 'content'
  const contentRoot = path.join(rootDirectory, contentDirectory)
  const entryPath = path.join(contentRoot, 'nested', 'entry.md')

  await fs.mkdir(path.dirname(entryPath), { recursive: true })

  const relativePath = await getRelativePath(
    { rootDirectory, contentDirectory },
    entryPath
  )

  t.equal(
    relativePath,
    path.join('nested', 'entry.md'),
    'returns a path relative to the content root'
  )

  await fs.rm(rootDirectory, { recursive: true })
})

test('getRelativePath uses the root when content directory is absent', async (t) => {
  const rootDirectory = await createTemporaryDirectory()
  const entryPath = path.join(rootDirectory, 'nested', 'entry.md')

  const relativePath = await getRelativePath(
    { rootDirectory, contentDirectory: 'missing-content' },
    entryPath
  )

  t.equal(
    relativePath,
    path.join('nested', 'entry.md'),
    'returns a path relative to the fallback content root'
  )

  await fs.rm(rootDirectory, { recursive: true })
})

test('validatePath accepts descendants of the content root', async (t) => {
  const rootDirectory = await createTemporaryDirectory()
  const contentDirectory = 'content'
  const contentRoot = path.join(rootDirectory, contentDirectory)

  await fs.mkdir(contentRoot)

  const isValid = await validatePath(
    { rootDirectory, contentDirectory },
    path.join(contentRoot, 'entry.md')
  )

  t.ok(isValid, 'accepts a path inside the content root')

  await fs.rm(rootDirectory, { recursive: true })
})

test('validatePath rejects the content root itself', async (t) => {
  const rootDirectory = await createTemporaryDirectory()
  const contentDirectory = 'content'
  const contentRoot = path.join(rootDirectory, contentDirectory)

  await fs.mkdir(contentRoot)

  const isValid = await validatePath(
    { rootDirectory, contentDirectory },
    contentRoot
  )

  t.notOk(isValid, 'rejects the content root')

  await fs.rm(rootDirectory, { recursive: true })
})

test('validatePath rejects paths outside the content root', async (t) => {
  const rootDirectory = await createTemporaryDirectory()
  const contentDirectory = 'content'
  const contentRoot = path.join(rootDirectory, contentDirectory)

  await fs.mkdir(contentRoot)

  const isValid = await validatePath(
    { rootDirectory, contentDirectory },
    path.join(rootDirectory, 'outside.md')
  )

  t.notOk(isValid, 'rejects a path outside the content root')

  await fs.rm(rootDirectory, { recursive: true })
})

test('validatePath accepts a root child when content directory is absent', async (t) => {
  const rootDirectory = await createTemporaryDirectory()

  const isValid = await validatePath(
    { rootDirectory, contentDirectory: 'missing-content' },
    path.join(rootDirectory, 'entry.md')
  )

  t.ok(isValid, 'accepts a direct child of the fallback content root')

  await fs.rm(rootDirectory, { recursive: true })
})

test('uploadAttachments writes every attachment buffer', async (t) => {
  const directory = await createTemporaryDirectory()
  const attachments = [
    { originalname: 'first.txt', buffer: Buffer.from('first') },
    { originalname: 'second.txt', buffer: Buffer.from('second') }
  ]

  await Promise.all(uploadAttachments(attachments, directory))

  const contents = await Promise.all(
    attachments.map(({ originalname }) => {
      return fs.readFile(path.join(directory, originalname), 'utf-8')
    })
  )

  t.deepEqual(
    contents,
    ['first', 'second'],
    'writes every attachment to its original filename'
  )

  await fs.rm(directory, { recursive: true })
})

test('attachment helpers return no operations for empty lists', (t) => {
  t.deepEqual(
    uploadAttachments([], '/unused'),
    [],
    'uploadAttachments returns no operations'
  )

  t.deepEqual(
    deleteAttachments([], '/unused'),
    [],
    'deleteAttachments returns no operations'
  )

  t.end()
})

test('deleteAttachments removes every named attachment', async (t) => {
  const directory = await createTemporaryDirectory()
  const fileNames = ['first.txt', 'second.txt']

  await Promise.all(
    fileNames.map(fileName => {
      return fs.writeFile(path.join(directory, fileName), fileName)
    })
  )

  await Promise.all(deleteAttachments(fileNames, directory))

  const remainingEntries = await fs.readdir(directory)

  t.deepEqual(remainingEntries, [], 'removes every named attachment')

  await fs.rm(directory, { recursive: true })
})
