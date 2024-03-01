import api from '../api.js'

const updateSettings = () => {
  const values = ['fi', 'en', 'tr']
  return api.settings.update({
    language: values[Math.floor(Math.random() * values.length)]
  })
}

export default updateSettings
