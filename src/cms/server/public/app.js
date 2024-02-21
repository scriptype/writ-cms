import getSettings from './getSettings.js'
import getFileSystemTree from './getFileSystemTree.js'
import getContentModel from './getContentModel.js'
import updateSettings from './updateSettings.js'
import getCategory from './getCategory.js'
import createCategory from './createCategory.js'
import getPosts from './getPosts.js'
import getPost from './getPost.js'
import createPost from './createPost.js'

const query = document.querySelector.bind(document)

const makeButtonsWork = () => {
  query('#get-settings-btn').addEventListener('click', getSettings)
  query('#get-file-system-tree-btn').addEventListener('click', getFileSystemTree)
  query('#get-content-model-btn').addEventListener('click', getContentModel)
  query('#update-settings-btn').addEventListener('click', updateSettings)
  query('#get-category-btn').addEventListener('click', getCategory)
  query('#create-category-btn').addEventListener('click', createCategory)
  query('#get-posts-btn').addEventListener('click', getPosts)
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
