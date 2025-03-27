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
    await this.renderer.render(contentModel)
    Debug.timeEnd('compiler')
    return {
      fileSystemTree,
      contentModel
    }
  }
}
