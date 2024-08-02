const contentTypes = require('../contentTypes')

const isLocalAsset = (fsObject) => {
  return fsObject.type === contentTypes.LOCAL_ASSET
}

const createLocalAsset = ({ stats, ...restFsObject }) => {
  return {
    ...restFsObject,
    type: contentTypes.LOCAL_ASSET
  }
}

module.exports = {
  isLocalAsset,
  createLocalAsset
}
