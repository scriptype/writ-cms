import api from '../../api.js'

const updateSettings = () => {
  const values = ['a', 'b', 'c', 'd']
  return api.settings.update({
    aNewSetting: values[Math.floor(Math.random() * values.length)]
  })
}

export default updateSettings
