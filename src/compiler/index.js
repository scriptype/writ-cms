const Debug = require('../debug')

module.exports = class Compiler {
  constructor({ fileSystemParser, contentModel, renderer }) {
    this.fileSystemParser = fileSystemParser
    this.contentModel = contentModel
    this.renderer = renderer
  }

  async compile() {
    Debug.timeStart('compiler')
    const fileSystemTree = await this.fileSystemParser.parse()
    const contentModel = this.contentModel.create(fileSystemTree)
    if (this.contentModel.render) {
      await this.renderer.init()
      await this.contentModel.render(this.renderer)
    } else {
      await this.renderer.render(contentModel)
    }
    Debug.timeEnd('compiler')
    return {
      fileSystemTree,
      contentModel
    }
  }
}
