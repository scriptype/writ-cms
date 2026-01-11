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
      return state.setState(
        await ssg.watch({
          rootDirectory,
          refreshTheme,
          debug,
          cli,
          onChange: state.setState
        })
      )
    }
  }
}

module.exports = createSSGModel
