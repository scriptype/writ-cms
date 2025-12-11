const ContentTypes = require('../content-types')

module.exports = class Compiler {
  constructor({ FileSystemParser, ContentModel, Renderer, settings, debug }) {
    this.FileSystemParser = FileSystemParser
    this.ContentModel = ContentModel
    this.Renderer = Renderer
    this.settings = settings
    this.debug = debug
    this.logger = {
      debug: debug.debugLog
    }
  }

  async compile() {
    if (typeof this.debug === 'object' && this.debug.timeStart) {
      this.debug.timeStart('compiler')
    }

    const fileSystemParser = new this.FileSystemParser(
      this.settings.fileSystemParser,
      this.logger
    )

    const fileSystemTree = await fileSystemParser.parse()

    const contentTypes = await ContentTypes.init(
      this.settings.contentTypes,
      this.logger
    )

    const contentModel = new this.ContentModel(
      fileSystemTree,
      this.settings.contentModel,
      contentTypes
    )

    if (contentModel.render) {
      await this.Renderer.init()
      await contentModel.render(this.Renderer)
    } else {
      await this.Renderer.render(contentModel)
    }

    this.debug.timeEnd('compiler')

    return {
      fileSystemTree,
      contentModel
    }
  }
}
