import api from './api.js'
import { setIframeSrc } from './common.js'

const findMostRecentProject = async () => {
  console.log('checking workspace')
  const workspace = await api.workspace.get()
  if (!workspace.projects) {
    console.log('workspace not found')
    return undefined
  }
  if (!workspace.projects.length) {
    console.log('no project not found')
    return undefined
  }
  console.log('workspace projects', workspace.projects)
  return workspace.projects[0]
}

const onboarding = async () => {
  console.log('first time onboarding')
  const newProject = await api.workspace.createProject({
    name: prompt('Project name')
  })
  return editProject({
    ssgOptions: {
      rootDirectory: newProject.path
    }
  })
}

const editProject = async ({ ssgOptions }) => {
  console.log('starting editor with ssgOptions', ssgOptions)
  await api.ssg.watch(ssgOptions)
  setIframeSrc()
}

window.addEventListener('DOMContentLoaded', async () => {
  const ssgOptions = await api.ssgOptions.get()
  if (ssgOptions.rootDirectory) {
    return editProject({
      ssgOptions
    })
  }
  const mostRecentProject = await findMostRecentProject()
  if (mostRecentProject) {
    console.log('running most recent project', mostRecentProject)
    return editProject({
      ssgOptions: {
        rootDirectory: mostRecentProject.path
      }
    })
  }
  onboarding()
})
