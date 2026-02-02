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

export {
  query,
  setIframeSrc,
  createDOMNodeFromHTML
}
