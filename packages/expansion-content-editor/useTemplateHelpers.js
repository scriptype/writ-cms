const useTemplateHelpers = (mode) =>
  (helpers) => ({
    seeMore: mode === 'start' ? `
        <img
          data-editable="true"
          data-section="summary"
          src="/assets/expansions/content-editor/transparent.png" />
        ` : helpers.seeMore
  })

module.exports = useTemplateHelpers
