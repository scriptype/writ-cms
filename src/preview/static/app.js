import Tool from './tool.js'

const createDOMNodeFromHTML = (html) => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

const Toolbar = (() => {
  let tools, el

  const createToolbar = () => {
    const toolbar = createDOMNodeFromHTML(`
      <div class="writ-toolbar">
        <div class="writ-toolbar-content">
          <div class="writ-toolbar-tool-group"></div>
          <div class="writ-toolbar-tool-group"></div>
        </div>
      </div>
    `)
    return toolbar
  }

  const createToolButton = async (tool) => {
    const id = tool.get('id')
    const label = tool.get('label')
    const buttonContent = tool.get('buttonContent')
    const toolButton = createDOMNodeFromHTML(`
      <div class="writ-toolbar-item tool-btn" data-tool-id="${id}">
        <input type="checkbox" id="tool-btn-${id}" />
        <label for="tool-btn-${id}">
          ${await buttonContent()}
        </label>
      </div>
    `)

    const checkbox = toolButton.querySelector(`#tool-btn-${id}`)
    checkbox.addEventListener('change', (event) => {
      if (!event.target.checked) {
        tool.deactivate()
      } else {
        tool.activate()
      }
    })

    return toolButton
  }

  const createSaveButton = async (onSave) => {
    const svgIcon = '/assets/preview/save-icon.svg'
    const svgIconSource = await fetch(svgIcon).then(r => r.text())
    const btn = createDOMNodeFromHTML(`
      <button class="writ-toolbar-item tool-btn" type="button" title="Save changes">
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
    el.querySelector('.writ-toolbar-tool-group:nth-child(2)').appendChild(toolButton)
  }

  const init = async () => {
    tools = []
    el = createToolbar()
    document.body.appendChild(el)
    const saveButton = await createSaveButton(() => {
      tools.forEach(tool => tool.options.save())
    })
    el.querySelector('.writ-toolbar-tool-group').appendChild(saveButton)
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
