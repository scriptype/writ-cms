const useTemplate = ({ mode }) =>
  (template) => {
    if (mode !== 'start') {
      return template
    }
    return template + '{{> content-editor }}'
  }

module.exports = useTemplate
