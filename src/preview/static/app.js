import Tool from './tool.js'

const createDOMNodeFromHTML = (html) => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

const Toolbar = (() => {
  let tools, el

  const handleToolbarItemHover = (toolbarItem) => {
    toolbarItem.addEventListener('mouseover', () => el.classList.add('expanded'))
    toolbarItem.addEventListener('mouseout', () => el.classList.remove('expanded'))
    toolbarItem.addEventListener('focus', () => el.classList.add('expanded'))
    toolbarItem.addEventListener('blur', () => el.classList.remove('expanded'))
  }

  const createToolbar = () => {
    const toolbar = createDOMNodeFromHTML(`
      <div id="writ-preview-toolbar">
        <div class="toolbar-tool-group"></div>
        <div class="toolbar-tool-group"></div>
      </div>
    `)
    return toolbar
  }

  const createToolButton = async (tool) => {
    const id = tool.get('id')
    const label = tool.get('label')
    const svgIcon = tool.get('svgIcon')
    const svgIconSource = await fetch(svgIcon).then(r => r.text())
    const btn = createDOMNodeFromHTML(`
      <div class="toolbar-item tool-btn">
        <input type="checkbox" id="tool-btn-${id}" />
        <label for="tool-btn-${id}">
          ${svgIconSource}
        </label>
      </div>
    `)

    const checkbox = btn.querySelector(`#tool-btn-${id}`)
    checkbox.addEventListener('change', (event) => {
      if (!event.target.checked) {
        tool.deactivate()
      } else {
        tool.activate()
      }
    })

    handleToolbarItemHover(btn)
    return btn
  }

  const createSaveButton = async (onSave) => {
    const svgIcon = '/assets/preview/save-icon.svg'
    const svgIconSource = await fetch(svgIcon).then(r => r.text())
    const btn = createDOMNodeFromHTML(`
      <button class="toolbar-item tool-btn" type="button" title="Save changes">
        ${svgIconSource}
      </button>
    `)
    btn.addEventListener('click', onSave)
    return btn
  }

  const addTool = async (tool) => {
    if (!(tool instanceof Tool)) {
      throw new Error('Only Tool instances are accepted.')
    }
    window.debugLog('Toolbar.addTool', tool)
    tools.push(tool)
    const toolButton = await createToolButton(tool)
    el.querySelector('.toolbar-tool-group:nth-child(2)').appendChild(toolButton)
  }

  const init = async () => {
    tools = []
    el = createToolbar()
    document.body.appendChild(el)
    const saveButton = await createSaveButton(() => {
      tools.forEach(tool => tool.options.save())
    })
    el.querySelector('.toolbar-tool-group').appendChild(saveButton)
  }

  return Object.freeze({
    el,
    tools,
    addTool,
    init
  })
})()

window.Preview = {
  Toolbar,
  Tool,
}

window.Preview.Toolbar.init()
