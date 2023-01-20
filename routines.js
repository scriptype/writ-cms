const Hooks = require('./hooks')
const Preview = require('./preview')

module.exports = {
  finaliseTemplate(template) {
    return Preview.useTemplate(
      Hooks.expandTemplate(template)
    )
  },

  finaliseTemplatePartials(partials) {
    return Preview.useTemplatePartials(
      Hooks.expandTemplatePartials(partials)
    )
  }
}
