import createPost from './createPost.js'
import getPost from './getPost.js'

const query = document.querySelector.bind(document)

const makeButtonsWork = () => {
  const createPostBtn = query('#create-post-btn')
  createPostBtn.addEventListener('click', createPost)

  const getPostBtn = query('#get-post-btn')
  getPostBtn.addEventListener('click', getPost)
}

const setIframeSrc = () => {
  const { hostname } = window.location
  query('#preview').src = `http://${hostname}:3000`
}

window.addEventListener('DOMContentLoaded', () => {
  setIframeSrc()
  makeButtonsWork()
})
