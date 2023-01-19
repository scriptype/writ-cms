const Watcher = require('./watcher')

module.exports = {
  init() {
    Watcher.init({
      api: require('./api')
    })
  }
}
