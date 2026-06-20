import api from '../api.js'
import editProject from './editProject.js'

const randomFrom = (list) => list[Math.floor(Math.random() * list.length)]

const randomProjectNames = [
  'The World',
  'My New Thing',
  'La Isla Bonita',
  'Ceci n\'est pas une pipe',
  'Aquaris',
  'Sunshine Recorder',
  'Aurora Borealis',
  'A Great Oak',
  'Brave New World',
  'A Brief History of Everything',
  'The year my parents went on vacation',
  'Something new',
  'Lorem site',
  'Bits and bops',
  'VGA vs HDMI'
]

const onboarding = async () => {
  console.log('first time onboarding')
  const newProject = await api.workspace.createProject({
    name: randomFrom(randomProjectNames)
  })
  const ssgOptions = {
    mode: 'start',
    rootDirectory: newProject.path
  }
  await api.ssgOptions.set(ssgOptions)
  return editProject({
    ssgOptions
  })
}

export default onboarding
