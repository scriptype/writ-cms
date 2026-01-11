const test = require('tape')
const fs = require('fs/promises')
const path = require('path')
const os = require('os')
const {
  readFileContent,
  loadJSON,
  isDirectory,
  ensureDirectory,
  atomicReplace
} = require('./fileSystemHelpers')

test('readFileContent reads utf-8 file content', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'test.txt')

  await fs.writeFile(filePath, 'hello world')

  const content = await readFileContent(filePath)

  t.equal(
    content,
    'hello world',
    'reads file with utf-8 encoding'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('readFileContent rejects on missing file', async (t) => {
  try {
    await readFileContent('/nonexistent/file.txt')
    t.fail('should have thrown error')
  } catch (error) {
    t.ok(
      error.code === 'ENOENT',
      'throws ENOENT error for missing file'
    )
  }
})

test('readFileContent handles empty file', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'empty.txt')

  await fs.writeFile(filePath, '')

  const content = await readFileContent(filePath)

  t.equal(
    content,
    '',
    'reads empty file as empty string'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('loadJSON parses valid JSON file', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'data.json')
  const data = { name: 'test', value: 42 }

  await fs.writeFile(filePath, JSON.stringify(data))

  const result = await loadJSON(filePath)

  t.deepEqual(
    result,
    data,
    'parses and returns JSON object'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('loadJSON returns empty object for missing file', async (t) => {
  const result = await loadJSON('/nonexistent/file.json')

  t.deepEqual(
    result,
    {},
    'returns empty object when file does not exist'
  )
})

test('loadJSON returns empty object for invalid JSON', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'invalid.json')

  await fs.writeFile(filePath, 'not valid json {')

  const result = await loadJSON(filePath)

  t.deepEqual(
    result,
    {},
    'returns empty object when JSON parsing fails'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('loadJSON handles empty JSON file', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'empty.json')

  await fs.writeFile(filePath, '{}')

  const result = await loadJSON(filePath)

  t.deepEqual(
    result,
    {},
    'parses empty JSON object'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('loadJSON handles nested objects', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'nested.json')
  const data = {
    user: { name: 'Alice', age: 30 },
    settings: { theme: 'dark' }
  }

  await fs.writeFile(filePath, JSON.stringify(data))

  const result = await loadJSON(filePath)

  t.deepEqual(
    result,
    data,
    'parses nested JSON structures'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('isDirectory returns true for directory', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))

  const result = await isDirectory(tempDir)

  t.ok(
    result,
    'returns true for existing directory'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('isDirectory returns false for file', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const filePath = path.join(tempDir, 'file.txt')

  await fs.writeFile(filePath, 'content')

  const result = await isDirectory(filePath)

  t.notOk(
    result,
    'returns false for file'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('isDirectory returns false for nonexistent path', async (t) => {
  const result = await isDirectory('/nonexistent/path')

  t.notOk(
    result,
    'returns false for missing path'
  )
})

test('isDirectory returns false for symlink (lstat does not follow links)', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const realDir = path.join(tempDir, 'realdir')
  const symlink = path.join(tempDir, 'link')

  await fs.mkdir(realDir)
  await fs.symlink(realDir, symlink)

  const result = await isDirectory(symlink)

  t.notOk(
    result,
    'returns false for symlink (lstat checks link itself, not target)'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory creates nonexistent directory', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const newDir = path.join(tempDir, 'newdir')

  await ensureDirectory(newDir)

  const stats = await fs.stat(newDir)

  t.ok(
    stats.isDirectory(),
    'directory was created'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory ignores if directory already exists', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))

  await ensureDirectory(tempDir)

  const stats = await fs.stat(tempDir)

  t.ok(
    stats.isDirectory(),
    'does not throw and directory still exists'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory creates nested directories', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const nestedPath = path.join(tempDir, 'a', 'b', 'c')

  await ensureDirectory(nestedPath)

  const stats = await fs.stat(nestedPath)

  t.ok(
    stats.isDirectory(),
    'creates all nested directories'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory throws on invalid path parameter', async (t) => {
  try {
    await ensureDirectory(null)
    t.fail('should have thrown error')
  } catch (error) {
    t.ok(
      error instanceof TypeError,
      'throws TypeError for null path'
    )
  }
})

test('ensureDirectory throws on undefined path parameter', async (t) => {
  try {
    await ensureDirectory(undefined)
    t.fail('should have thrown error')
  } catch (error) {
    t.ok(
      error instanceof TypeError,
      'throws TypeError for undefined path'
    )
  }
})

test('atomicReplace builds in temp location then swaps', async (t) => {
  const baseTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const targetPath = path.join(baseTemp, 'target')

  await atomicReplace(targetPath, async (tempPath) => {
    await fs.writeFile(path.join(tempPath, 'file.txt'), 'content')
  })

  const content = await fs.readFile(path.join(targetPath, 'file.txt'), 'utf-8')

  t.equal(
    content,
    'content',
    'file was created in target directory'
  )

  await fs.rm(baseTemp, { recursive: true })
})

test('atomicReplace replaces existing directory', async (t) => {
  const baseTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const targetPath = path.join(baseTemp, 'target')

  await fs.mkdir(targetPath)
  await fs.writeFile(path.join(targetPath, 'old.txt'), 'old content')

  await atomicReplace(targetPath, async (tempPath) => {
    await fs.writeFile(path.join(tempPath, 'new.txt'), 'new content')
  })

  const exists = await fs.stat(path.join(targetPath, 'new.txt'))
  const oldExists = await fs.stat(path.join(targetPath, 'old.txt')).catch(() => null)

  t.ok(
    exists.isFile(),
    'new file exists in target'
  )

  t.notOk(
    oldExists,
    'old file was deleted'
  )

  await fs.rm(baseTemp, { recursive: true })
})

test('atomicReplace cleans up temp on build function error', async (t) => {
  const baseTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const targetPath = path.join(baseTemp, 'target')

  try {
    await atomicReplace(targetPath, async () => {
      throw new Error('build failed')
    })
    t.fail('should have thrown error')
  } catch (error) {
    t.equal(
      error.message,
      'build failed',
      'error is propagated'
    )
  }

  const targetExists = await fs.stat(targetPath).catch(() => null)

  t.notOk(
    targetExists,
    'target directory not created on failure'
  )

  await fs.rm(baseTemp, { recursive: true })
})

test('atomicReplace works with nested directories', async (t) => {
  const baseTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const targetPath = path.join(baseTemp, 'target')
  const nestedPath = path.join('sub', 'nested', 'file.txt')

  await atomicReplace(targetPath, async (tempPath) => {
    await fs.mkdir(path.join(tempPath, 'sub', 'nested'), { recursive: true })
    await fs.writeFile(path.join(tempPath, nestedPath), 'nested')
  })

  const content = await fs.readFile(
    path.join(targetPath, nestedPath),
    'utf-8'
  )

  t.equal(
    content,
    'nested',
    'nested structure preserved'
  )

  await fs.rm(baseTemp, { recursive: true })
})
