import exploreTree from './fileSystem.js'
import getSettings from './getSettings.js'
import updateSettings from './updateSettings.js'
import getCategory from './getCategory.js'
import createCategory from './createCategory.js'
import getPost from './getPost.js'
import createPost from './createPost.js'

const query = document.querySelector.bind(document)

const makeButtonsWork = () => {
  query('#explore-tree-btn').addEventListener('click', exploreTree)
  query('#get-settings-btn').addEventListener('click', getSettings)
  query('#update-settings-btn').addEventListener('click', updateSettings)
  query('#get-category-btn').addEventListener('click', getCategory)
  query('#create-category-btn').addEventListener('click', createCategory)
  query('#get-post-btn').addEventListener('click', getPost)
  query('#create-post-btn').addEventListener('click', createPost)
}

const setIframeSrc = () => {
  const { hostname } = window.location
  query('#preview').src = `http://${hostname}:3000`
}

window.addEventListener('DOMContentLoaded', () => {
  setIframeSrc()
  makeButtonsWork()
})
