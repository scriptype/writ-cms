const useTemplate = (mode) =>
  (template) =>
    template + (
      mode === 'start' ?
        '{{> content-editor }}' :
      ''
    )

module.exports = useTemplate
