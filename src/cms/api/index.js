const createAPI = (providers) => {
  const api = {}
  api.settings = require('./models/settings')(providers, api)
  api.fileSystemTree = require('./models/fileSystemTree')(providers, api)
  api.contentModel = require('./models/contentModel')(providers, api)
  api.contentTypes = require('./models/contentTypes')(providers, api)
  api.collections = require('./models/collections')(providers, api)
  api.subpages = require('./models/subpages')(providers, api)
  api.subpage = require('./models/subpage')(providers, api)
  api.homepage = require('./models/homepage')(providers, api)
  api.ssg = require('./models/ssg')(providers, api)
  api.ssgOptions = require('./models/ssgOptions')(providers, api)
  api.workspace = require('./models/workspace')(providers, api)
  return api
}

module.exports = createAPI
