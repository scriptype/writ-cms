import api from './api.js'
import onboarding from './app/onboarding.js'
import editProject from './app/editProject.js'

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
