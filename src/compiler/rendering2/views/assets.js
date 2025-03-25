const copyAssets = async (Renderer, contentModel) => {
  return Promise.all(
    contentModel.assets.map(node => {
      return Renderer.copy({
        src: node.absolutePath,
        dest: node.outputPath,
        recursive: !!node.children
      })
    })
  )
}

module.exports = copyAssets
