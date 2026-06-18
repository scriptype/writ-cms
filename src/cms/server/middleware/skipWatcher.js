const skipWatcher = (state) => {
  return (req, res, next) => {
    state.skipWatcherBuild()

    res.on('finish', () => {
      setTimeout(() => {
        state.unskipWatcherBuild()
      }, 500)
    })

    next()
  }
}

module.exports = skipWatcher
