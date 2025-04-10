const _ = require('lodash')
const Debug = require('./debug')
const Settings = require('./settings')
const Decorations = require('./decorations')
const VersionControl = require('./version-control')
const Theme = require('./theme')
const Hooks = require('./hooks')
const Expansions = require('./expansions')
const SiteDirectory = require('./site-directory')
const CNAME = require('./cname')
const Dictionary = require('./dictionary')
const ContentTypes = require('./content-types')
const FileSystemParser = require('./lib/FileSystemParser')
const ContentModel1 = require('./compiler/contentModel')
const ContentModel2 = require('./compiler/contentModel2')
const Rendering1 = require('./compiler/rendering')
const Rendering2 = require('./compiler/rendering2')
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
    Dictionary.decorator(),
    VersionControl.decorator(),
    Theme.decorator(),
    Preview.decorator(),
    Expansions.decorator(),
    Hooks.decorator()
  )
  await Theme.init({
    refresh: refreshTheme
  })
  await VersionControl.init()
  await Dictionary.init()
  await SiteDirectory.create()
  await CNAME.create()

  let contentTypes = []
  if (settings.compilerVersion === 2) {
    contentTypes = await ContentTypes.init(
      _.pick(settings, [
        'rootDirectory',
        'contentTypesDirectory'
      ])
    )
  }

  const logger = {
    debug: Debug.debugLog
  }
  const { fileSystemTree, contentModel } = await new Compiler({
    fileSystemParser: new FileSystemParser(
      _.pick(settings, [
        'rootDirectory',
        'contentDirectory',
        'IGNORE_PATHS_REG_EXP'
      ]),
      logger
    ),

    contentModel: settings.compilerVersion === 2 ?
      new ContentModel2(
        _.pick(settings, [
          'permalinkPrefix',
          'out',
          'defaultCategoryName',
          'assetsDirectory',
          'pagesDirectory',
          'homepageDirectory'
        ]),
        contentTypes
      ) :
      ContentModel1,

    renderer: settings.compilerVersion === 2 ?
      Rendering2 :
      Rendering1
  }).compile()
  if (settings.compilerVersion === 1) {
    await Assets.copyAssets()
  }

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
