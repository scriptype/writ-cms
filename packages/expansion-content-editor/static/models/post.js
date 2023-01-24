const restoreSeeMore = (content) => {
  const el = document.createElement('div')
  el.innerHTML = content
  const seeMore = el.querySelector('img[alt="writ summary divider"]')
  const parentNode = seeMore.parentNode
  const grandParentNode = parentNode.parentNode
  if (grandParentNode && !grandParentNode.querySelector('[data-section="content"]')) {
    const isFirst = !seeMore.previousSibling
    const isOnly = isFirst && !seeMore.nextSibling
    const insertPosition = isFirst ? 'beforeBegin' : 'afterEnd'
    parentNode.insertAdjacentElement(insertPosition, seeMore)
    if (isOnly) {
      parentNode.remove()
    }
    return restoreSeeMore(el.innerHTML)
  }
  seeMore.replaceWith('\{\{seeMore}}')
  return el.innerHTML
}

export default {
  updateContent(path, content) {
    return fetch(`/cms/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: restoreSeeMore(content),
        path
      })
    })
  },

  updateTitle(path, title, foldered) {
    return fetch(`/cms/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        updateUrl: true,
        path,
        foldered
      })
    })
  }
}
