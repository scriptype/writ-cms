const createState = (defaults) => {
  let data = {
    ...defaults
  }

  return {
    data,

    get(key) {
      if (key) {
        return data[key]
      }
      return data
    },

    set(key, value) {
      data[key] = value
    },

    setState(state) {
      data = {
        ...data,
        ...state
      }
    }
  }
}

export default createState
