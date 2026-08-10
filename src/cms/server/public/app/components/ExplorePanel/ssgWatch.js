import api from '../../../api.js'

const ssgWatch = async () => {
  const ssgOptions = await api.ssgOptions.get()
  return api.ssg.watch(ssgOptions)
}

export default ssgWatch
