const { homedir } = require('os')
const { join } = require('path')
const { mkdir, readdir, stat } = require('fs/promises')

const createWorkspaceModel = (state) => {
  const directoryName = 'writ projects'
  const directoryPath = join(homedir(), directoryName)

  const createProject = async (name) => {
    const path = join(directoryPath, name)
    const stats = await stat(path)
    return {
      name,
      path,
      dateModified: stats.mtime
    }
  }

  return {
    async get() {
      try {
        const directory = await readdir(directoryPath, { withFileTypes: true })
        const isProject = item => item.isDirectory()
        const projects = await Promise.all(
          directory
            .filter(isProject)
            .map(item => createProject(item.name))
        )
        return {
          projects: projects.sort((a, b) => b.dateModified - a.dateModified)
        }
      } catch (e) {
        return {}
      }
    },

    async create() {
      try {
        console.log('api.workspace.creating workspace folder')
        await mkdir(directoryPath)
      } catch (e) {
        if (e.code !== 'EEXIST') {
          console.log('api.workspace.create.error', e)
          throw e
        }
        console.log('workspace already exists')
      }
      return this.get()
    },

    async createProject({ name }) {
      await this.create()
      const path = join(directoryPath, name)
      await mkdir(path)
      return createProject(name)
    }
  }
}

module.exports = createWorkspaceModel
