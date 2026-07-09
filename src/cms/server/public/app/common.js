const query = document.querySelector.bind(document)

const setIframeSrc = () => {
  const { hostname } = window.location
  query('#preview').src = `http://${hostname}:3000`
}

const createDOMNodeFromHTML = (html) => {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstElementChild
}

const normalizePath = (path) => {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/')
}

const getPathSegments = (path) => {
  return normalizePath(path)
    .split('/')
    .filter(Boolean)
}

export {
  query,
  setIframeSrc,
  createDOMNodeFromHTML,
  normalizePath,
  getPathSegments
}
