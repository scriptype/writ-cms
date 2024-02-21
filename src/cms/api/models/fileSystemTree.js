const createFileSystemTreeModel = ({ getFileSystemTree }) => {
  return {
    get: getFileSystemTree
  }
}

module.exports = createFileSystemTreeModel
