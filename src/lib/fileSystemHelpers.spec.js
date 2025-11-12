const test = require('tape')
const fs = require('fs/promises')
const path = require('path')
const os = require('os')
const {
  readFileContent,
  loadJSON,
  isDirectory,
  ensureDirectory
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

  const result = await ensureDirectory(newDir)

  t.ok(result, 'returns true')

  const stats = await fs.stat(newDir)

  t.ok(
    stats.isDirectory(),
    'directory was created'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory with existing directory', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))

  const result = await ensureDirectory(tempDir)

  t.ok(
    result,
    'returns true for existing directory'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory creates nested directories', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  const nestedPath = path.join(tempDir, 'a', 'b', 'c')

  const result = await ensureDirectory(nestedPath)

  t.ok(result, 'returns true')

  const stats = await fs.stat(nestedPath)

  t.ok(
    stats.isDirectory(),
    'creates all nested directories'
  )

  await fs.rm(tempDir, { recursive: true })
})

test('ensureDirectory returns true on error', async (t) => {
  const result = await ensureDirectory(null)

  t.ok(
    result,
    'returns true even when mkdir fails'
  )
})
