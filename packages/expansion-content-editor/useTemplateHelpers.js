const useTemplateHelpers = (mode) =>
  (helpers) => ({
    seeMore: mode === 'start' ? `
        <img
          alt="writ summary divider"
          src="/assets/expansions/content-editor/transparent.png" />
        ` : helpers.seeMore
  })

module.exports = useTemplateHelpers
