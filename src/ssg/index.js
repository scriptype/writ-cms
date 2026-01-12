const _ = require('lodash')
const slug = require('slug')
const Debug = require('./debug')
const Settings = require('./settings')
const Decorations = require('./decorations')
const Theme = require('./theme')
const Hooks = require('./hooks')
const Expansions = require('./expansions')
const SiteDirectory = require('./site-directory')
const CNAME = require('./cname')
const FileSystemParser = require('./lib/FileSystemParser')
const ContentModel = require('./compiler/contentModel')
const Renderer = require('./compiler/renderer')
const Compiler = require('./compiler')
const Assets = require('./assets')
const Preview = require('./preview')
const Watcher = require('./watcher')

const build = async ({ mode = 'build', rootDirectory, refreshTheme, debug, cli }) => {
  Debug.init(debug)
  Debug.timeStart('> total')
  await Settings.init({
    mode,
    rootDirectory
  })
  const settings = Settings.getSettings()
  await Expansions.init()
  Decorations.register(
    Theme.decorator(),
    Preview.decorator(),
    Expansions.decorator(),
    Hooks.decorator()
  )
  await Theme.init({
    refresh: refreshTheme
  })
  await SiteDirectory.create()
  await CNAME.create()

  const { fileSystemTree, contentModel } = await new Compiler({
    FileSystemParser,
    ContentModel,
    Renderer,
    debug: Debug,
    settings: {
      contentTypes: _.pick(settings, [
        'rootDirectory',
        'contentTypesDirectory'
      ]),
      fileSystemParser: _.pick(settings, [
        'rootDirectory',
        'contentDirectory',
        'IGNORE_PATHS_REG_EXP'
      ]),
      contentModel: {
        ..._.pick(settings, [
          'permalinkPrefix',
          'out',
          'defaultCategoryName',
          'assetsDirectory',
          'pagesDirectory',
          'homepageDirectory',
          'site',
          'mode'
        ]),
        debug: Debug.getDebug()
      }
    }
  }).compile()

  await Assets.copyAssets()

  Debug.timeEnd('> total')
  Debug.logTimes()

  return {
    settings,
    fileSystemTree,
    contentModel
  }
}

const watch = async ({ rootDirectory, refreshTheme, debug, cli, onChange = _=>_ }) => {
  await Settings.init({
    mode: 'watch',
    rootDirectory
  })
  const settings = Settings.getSettings()

  const buildOptions = {
    mode: 'watch',
    rootDirectory,
    refreshTheme,
    debug,
    cli
  }

  const watcherOptions = {
    settings,
    silent: !buildOptions.cli,
    async onChange() {
      return onChange(await build(buildOptions))
    }
  }

  const watcher = await Watcher.init(watcherOptions)
  const result = await build(buildOptions)

  return {
    result,
    watcher
  }
}

module.exports = {
  ...Hooks.api,
  build,
  watch,
  getDefaultSettings: Settings.getDefaultSettings,
  helpers: {
    slug
  }
}
