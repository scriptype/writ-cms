const _ = require('lodash')
const Debug = require('./debug')
const Settings = require('./settings')
const Decorations = require('./decorations')
const Theme = require('./theme')
const Hooks = require('./hooks')
const Expansions = require('./expansions')
const SiteDirectory = require('./site-directory')
const CNAME = require('./cname')
const ContentTypes = require('./content-types')
const FileSystemParser = require('./lib/FileSystemParser')
const ContentModel = require('./compiler/contentModel')
const Renderer = require('./compiler/renderer')
const Compiler = require('./compiler')
const Assets = require('./assets')
const Preview = require('./preview')
const Watcher = require('./watcher')
const createCMS = require('./cms')

const startUp = async ({ debug, watch, startCMSServer, onFinish, ...rest }) => {
  Debug.init(debug)
  Debug.timeStart('> total')
  const cms = createCMS()
  const runOptions = {
    finishCallback: async (state) => {
      cms.setState(state)
      if (typeof onFinish === 'function') {
        await onFinish(state)
      }
      Debug.timeEnd('> total')
      Debug.logTimes()
    },
    debug,
    ...rest
  }
  await run(runOptions)
  if (watch) {
    if (startCMSServer !== false) {
      cms.server.start({
        silent: !rest.cli
      })
    }
    return startWatcher(runOptions)
  }
}

const run = async ({ mode, rootDirectory, refreshTheme, finishCallback }) => {
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

  const logger = {
    debug: Debug.debugLog
  }

  const contentTypes = await ContentTypes.init(
    _.pick(settings, [
      'rootDirectory',
      'contentTypesDirectory'
    ]),
    logger
  )

  const { fileSystemTree, contentModel } = await new Compiler({
    fileSystemParser: new FileSystemParser(
      _.pick(settings, [
        'rootDirectory',
        'contentDirectory',
        'IGNORE_PATHS_REG_EXP'
      ]),
      logger
    ),

    contentModel: new ContentModel({
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
    }, contentTypes),

    renderer: Renderer
  }).compile()

  await Assets.copyAssets()

  await finishCallback({
    settings,
    fileSystemTree,
    contentModel,
    contentTypes
  })
}

const startWatcher = (options) => {
  return Watcher.init({
    onChange() {
      Debug.init(options.debug)
      Debug.timeStart('> total')
      return run(options)
    },
    silent: !options.cli
  })
}

const Routines = {
  startUp,
  run,
  startWatcher
}

module.exports = Routines
