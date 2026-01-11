const createSSGOPtionsModel = ({ getSSGOptions }) => {
  return {
    get: getSSGOptions
  }
}

module.exports = createSSGOPtionsModel
