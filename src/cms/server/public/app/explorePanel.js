import { query, createDOMNodeFromHTML, setIframeSrc } from '../common.js'
import ssgBuild from './explorePanel/ssgBuild.js'
import ssgWatch from './explorePanel/ssgWatch.js'
import ssgStopWatcher from './explorePanel/ssgStopWatcher.js'
import getSSGOptions from './explorePanel/getSSGOptions.js'
import getSettings from './explorePanel/getSettings.js'
import updateSettings from './explorePanel/updateSettings.js'
import getFileSystemTree from './explorePanel/getFileSystemTree.js'
import getContentModel from './explorePanel/getContentModel.js'
import getCollections from './explorePanel/getCollections.js'
import getSubpages from './explorePanel/getSubpages.js'
import getSubpage from './explorePanel/getSubpage.js'
import createSubpage from './explorePanel/createSubpage.js'
import getHomepage from './explorePanel/getHomepage.js'
import createHomepage from './explorePanel/createHomepage.js'

const template = () => {
  return `
    <div class="panel explore-panel">
      <p>ssg</p>
      <button type="button" id="ssg-build-btn">ssg.build()</button>
      <button type="button" id="ssg-watch-btn">ssg.watch()</button>
      <button type="button" id="ssg-stop-watcher-btn">ssg.stopWatcher()</button>
      <button type="button" id="get-ssg-options-btn">get ssg options</button>

      <p>settings</p>
      <button type="button" id="get-settings-btn">get settings</button>
      <button type="button" id="update-settings-btn">update settings</button>

      <p>fileSystemTree</p>
      <button type="button" id="get-file-system-tree-btn">get fileSystemTree</button>

      <p>contentModel</p>
      <button type="button" id="get-content-model-btn">get contentModel</button>

      <p>collections</p>
      <button type="button" id="get-collections-btn">get all collections</button>

      <p>homepage</p>
      <button type="button" id="get-homepage-btn">get homepage</button>
      <button type="button" id="create-homepage-btn">create homepage</button>

      <p>subpages</p>
      <button type="button" id="get-subpages-btn">get all subpages</button>
      <button type="button" id="get-subpage-btn">get subpage</button>
      <button type="button" id="create-subpage-btn">create subpage</button>
    </div>
  `
}

const makeButtonsWork = (panel) => {
  panel.querySelector('#ssg-build-btn').addEventListener('click', async () => {
    await ssgBuild()
    setIframeSrc()
  })
  panel.querySelector('#ssg-watch-btn').addEventListener('click', async () => {
    await ssgWatch()
    setIframeSrc()
  })
  panel.querySelector('#ssg-stop-watcher-btn').addEventListener('click', async () => {
    await ssgStopWatcher()
    setIframeSrc()
  })
  panel.querySelector('#get-ssg-options-btn').addEventListener('click', getSSGOptions)
  panel.querySelector('#get-settings-btn').addEventListener('click', getSettings)
  panel.querySelector('#update-settings-btn').addEventListener('click', updateSettings)
  panel.querySelector('#get-file-system-tree-btn').addEventListener('click', getFileSystemTree)
  panel.querySelector('#get-content-model-btn').addEventListener('click', getContentModel)
  panel.querySelector('#get-collections-btn').addEventListener('click', getCollections)
  panel.querySelector('#get-subpages-btn').addEventListener('click', getSubpages)
  panel.querySelector('#get-subpage-btn').addEventListener('click', getSubpage)
  panel.querySelector('#create-subpage-btn').addEventListener('click', createSubpage)
  panel.querySelector('#get-homepage-btn').addEventListener('click', getHomepage)
  panel.querySelector('#create-homepage-btn').addEventListener('click', createHomepage)
}

const makeDraggable = (element) => {
  let offsetX = 0
  let offsetY = 0

  element.addEventListener('mousedown', (e) => {
    offsetX = e.clientX - element.offsetLeft
    offsetY = e.clientY - element.offsetTop

    const move = (e) => {
      element.style.left = (e.clientX - offsetX) + 'px'
      element.style.top = (e.clientY - offsetY) + 'px'
    }

    const stop = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', stop)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', stop)
  })
}

const makeCollapsible = (element) => {
  element.classList.toggle(
    'collapsed',
    JSON.parse((localStorage.getItem('ui') || '{}')).explorePanelCollapsed
  )
  element.addEventListener('dblclick', () => {
    element.classList.toggle('collapsed')
    localStorage.setItem('ui', JSON.stringify({
      ...JSON.parse(localStorage.getItem('ui') || '{}'),
      explorePanelCollapsed: element.classList.contains('collapsed')
    }))
  })
}

window.addEventListener('DOMContentLoaded', () => {
  const explorePanel = createDOMNodeFromHTML(template())
  makeButtonsWork(explorePanel)
  makeDraggable(explorePanel)
  makeCollapsible(explorePanel)

  const container = query('#panels-container')
  container.appendChild(explorePanel)
})
