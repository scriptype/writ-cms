function initMetadataIcons({
  dateCell,
  categoryCell,
  tagCells,
  dateIconTmpl,
  categoryIconTmpl,
  tagIconTmpl
}) {
  const dateAltText = dateCell.textContent
  const dateIcon = dateIconTmpl.content.firstElementChild
  dateCell.innerHTML = dateIcon.cloneNode(true).outerHTML
  dateCell.title = dateAltText

  if (categoryCell) {
    const categoryAltText = categoryCell.textContent
    const categoryIcon = categoryIconTmpl.content.firstElementChild
    categoryCell.innerHTML = categoryIcon.cloneNode(true).outerHTML
    categoryCell.title = categoryAltText
  }

  if (tagCells) {
    const tagIcon = tagIconTmpl.content.firstElementChild
    tagCells.forEach(cell => {
      cell.innerHTML = tagIcon.cloneNode(true).outerHTML
    })
  }
}

export default initMetadataIcons
