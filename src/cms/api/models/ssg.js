const ssg = require('../../../ssg')

const createSSGModel = (state) => {
  return {
    async build({ rootDirectory, refreshTheme, debug, cli }) {
      return state.setState(
        await ssg.build({
          rootDirectory,
          refreshTheme,
          debug,
          cli
        })
      )
    },

    async watch({ rootDirectory, refreshTheme, debug, cli }) {
      if (state.isWatching()) {
        if (state.isWatching(rootDirectory)) {
          console.log(`is already watching, not gonna do a thing (watching: ${rootDirectory})`)
          return false
        }
        console.log(`was watching another. stopping it so now watch: ${rootDirectory}`)
        await this.stopWatcher()
      }
      const { result, watcher } = await ssg.watch({
        rootDirectory,
        refreshTheme,
        debug,
        cli,
        onChange: state.setState
      })
      state.startWatcher({
        directory: rootDirectory,
        stop: watcher.stop
      })
      state.setState(result)
      return true
    },

    async stopWatcher() {
      if (!state.isWatching()) {
        return false
      }
      await state.stopWatcher()
      return true
    }
  }
}

module.exports = createSSGModel
