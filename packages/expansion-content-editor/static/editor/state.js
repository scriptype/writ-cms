const getState = (key) => {
  try {
    return {
      data: JSON.parse(localStorage.getItem(key))
    }
  } catch (error) {
    return {
      error
    }
  }
}

const setState = (state, key) => {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    return {
      error
    }
  }
}

const createState = ({ key, defaults: _defaults }) => {
  let defaults = {..._defaults}
  const localStorageKey = key
  console.log('create parameters', key, defaults)
  const stored = getState(localStorageKey)
  console.log('create stored', stored)
  if (stored.error) {
    console.error('create could not retrieve stored', stored.error)
  }
  let data = {
    ...defaults,
    ...(stored.data || {})
  }
  console.log('create data', data)

  return {
    get(key) {
      if (key) {
        return data[key]
      }
      return data
    },

    set(state) {
      data = {
        ...data,
        ...state
      }
      console.log('set state', data)
      setState(data, key)
    }
  }
}

export default createState
