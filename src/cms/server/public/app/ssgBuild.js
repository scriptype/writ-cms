import api from '../api.js'

const ssgBuild = async () => {
  const ssgOptions = await api.ssgOptions.get()
  return api.ssg.build(ssgOptions)
}

export default ssgBuild
