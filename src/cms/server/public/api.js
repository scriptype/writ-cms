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
  category: {
    get: async (options) => {
      const { name } = options
      const response = await fetch(`/api/category/${encodeURI(name)}`, {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    create: async (options) => {
      const response = await fetch('/api/category', {
        method: 'put',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.json()
    }
  },

  categories: {
    get: async () => {
      const response = await fetch('/api/categories', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
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
      return response.json()
    }
  },

  post: {
    get: async (options) => {
      const query = makeQueryString(options)
      const queryString = query ? `?${query}` : ''
      const response = await fetch(`/api/post/${queryString}`, {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    },

    create: async (options) => {
      const response = await fetch('/api/post', {
        method: 'put',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      return response.json()
    }
  },

  posts: {
    get: async () => {
      const response = await fetch('/api/posts', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
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
      return response.json()
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
  },

  tag: {
    get: async (options) => {
      const query = makeQueryString(options)
      const queryString = query ? `?${query}` : ''
      const response = await fetch(`/api/tag/${queryString}`, {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
      return response.json()
    }
  },

  tags: {
    get: async () => {
      const response = await fetch('/api/tags', {
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
