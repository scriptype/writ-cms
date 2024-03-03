import initMetadataIcons from './metadataIcons.js'
import initMusicListIcons from './musicListIcons.js'

const UI = {
  metadataDate: document.querySelector('.subpage-metadata-date td:first-child'),
  metadataTags: Array.from(document.querySelectorAll('.subpage-metadata-tags td:first-child')),
  musicListItems: Array.from(document.querySelectorAll('.subpage-music-list li')),
  dateIconTmpl: document.querySelector('#date-icon-tmpl'),
  tagIconTmpl: document.querySelector('#tag-icon-tmpl'),
  musicListIconTmpl: document.querySelector('#music-list-icon-tmpl'),
}

initMetadataIcons({
  dateCell: UI.metadataDate,
  tagCells: UI.metadataTags,
  dateIconTmpl: UI.dateIconTmpl,
  categoryIconTmpl: UI.categoryIconTmpl,
  tagIconTmpl: UI.tagIconTmpl
})

initMusicListIcons(UI.musicListItems, {
  musicListIconTmpl: UI.musicListIconTmpl
})
