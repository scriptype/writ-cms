function initMusicListIcons(musicListItems, { musicListIconTmpl }) {
  const icon = musicListIconTmpl.content.firstElementChild
  musicListItems.forEach(item => {
    item.prepend(icon.cloneNode(true))
  })
}

export default initMusicListIcons
