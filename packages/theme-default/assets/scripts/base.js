function initDarkMode(darkToggle) {
  const getDarkMemory = () => JSON.parse(localStorage.getItem('dark'))

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark')
    const darkMemory = getDarkMemory()
    localStorage.setItem('dark', !darkMemory)
  })

  document.body.classList.toggle('dark', getDarkMemory())
}

const UI = {
  darkToggle: document.querySelector('#dark-toggle')
}

initDarkMode(UI.darkToggle)
