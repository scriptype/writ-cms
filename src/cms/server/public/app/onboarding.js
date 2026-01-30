import api from '../api.js'
import editProject from './editProject.js'

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

export default onboarding
