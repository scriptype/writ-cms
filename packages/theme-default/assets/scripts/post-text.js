function initPostMetadataIcons({
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

function initMusicListIcons(musicListItems, { musicListIconTmpl }) {
  const icon = musicListIconTmpl.content.firstElementChild
  musicListItems.forEach(item => {
    item.prepend(icon.cloneNode(true))
  })
}

const UI = {
  postMetadataDate: document.querySelector('.post-metadata-date td:first-child'),
  postMetadataCategory: document.querySelector('.post-metadata-category td:first-child'),
  postMetadataTags: Array.from(document.querySelectorAll('.post-metadata-tags td:first-child')),
  postMusicListItems: Array.from(document.querySelectorAll('.post-music-list li')),
  dateIconTmpl: document.querySelector('#date-icon-tmpl'),
  categoryIconTmpl: document.querySelector('#category-icon-tmpl'),
  tagIconTmpl: document.querySelector('#tag-icon-tmpl'),
  musicListIconTmpl: document.querySelector('#music-list-icon-tmpl'),
}

initPostMetadataIcons({
  dateCell: UI.postMetadataDate,
  categoryCell: UI.postMetadataCategory,
  tagCells: UI.postMetadataTags,
  dateIconTmpl: UI.dateIconTmpl,
  categoryIconTmpl: UI.categoryIconTmpl,
  tagIconTmpl: UI.tagIconTmpl
})
initMusicListIcons(UI.postMusicListItems, {
  musicListIconTmpl: UI.musicListIconTmpl
})
