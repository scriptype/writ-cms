import createContentEditorTool from './tool.js'

window.addEventListener('DOMContentLoaded', () => {
  window.Preview.Toolbar.addTool(createContentEditorTool())
})
