import api from '../../../api.js'

const ssgStopWatcher = async () => {
  return api.ssg.stopWatcher()
}

export default ssgStopWatcher
