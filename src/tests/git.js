const Git = require('../git')

;(async () => {
  const hasGit = await Git.has()
  console.log('has git?', hasGit)
  if (!hasGit) {
    console.log('initting git')
    await Git.init()
  }
  console.log('staging files')
  await Git.stageFiles(['world.txt'])
  console.log('committing')
  await Git.commit('world')
  console.log('done')
})()
