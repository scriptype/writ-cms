const makeQueryString = (params) => {
  const query = new URLSearchParams()
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      query.append(key, encodeURI(params[key]))
    }
  }
  return query.toString()
}

const api = {
  ssg: {
    build: async (options) => {
      const response = await fetch('/api/ssg/build', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.text()
    },

    watch: async (options) => {
      const response = await fetch('/api/ssg/watch', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.text()
    },

    stopWatcher: async () => {
      const response = await fetch('/api/ssg/stop-watcher', {
        method: 'post'
      })
      return response.text()
    }

  },

  ssgOptions: {
    get: async () => {
      const response = await fetch('/api/ssgOptions', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    }
  },

  workspace: {
    get: async () => {
      const response = await fetch('/api/workspace', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    create: async () => {
      const response = await fetch('/api/workspace', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    createProject: async (options) => {
      const response = await fetch('/api/workspace/project', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.json()
    }
  },

  settings: {
    get: async () => {
      const response = await fetch('/api/settings', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    update: async (options) => {
      const response = await fetch('/api/settings', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.json()
    }
  },

  contentTypes: {
    get: async () => {
      const response = await fetch('/api/contentTypes', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    create: async (options) => {
      const response = await fetch('/api/contentTypes', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.json()
    }
  },

  contentModel: {
    get: async () => {
      const response = await fetch('/api/contentModel', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    }
  },

  fileSystemTree: {
    get: async () => {
      const response = await fetch('/api/fileSystemTree', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    }
  },

  collections: {
    get: async () => {
      const response = await fetch('/api/collections', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    }
  },

  homepage: {
    get: async () => {
      const response = await fetch('/api/homepage', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    create: async (options) => {
      const response = await fetch('/api/homepage', {
        method: 'put',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.text()
    }
  },

  subpage: {
    get: async (options) => {
      const query = makeQueryString(options)
      const queryString = query ? `?${query}` : ''
      const response = await fetch(`/api/subpage/${queryString}`, {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    create: async (options) => {
      const response = await fetch('/api/subpage', {
        method: 'put',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.text()
    }
  },

  subpages: {
    get: async () => {
      const response = await fetch('/api/subpages', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    }
  }
}

export default api
