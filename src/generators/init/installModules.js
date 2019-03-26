const npm = require('npm')

const promisifiedLoad = () => new Promise((resolve, reject) => {
  npm.load((err) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve()
  })
})

const promisifiedInstall = modules => new Promise((resolve, reject) => {
  npm.commands.install(modules, (err, data) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve(data)
  })
})

const installModules = async (modules, saveDev = false) => {
  await promisifiedLoad()
  npm.config.set('save-dev', saveDev)
  npm.config.set('save-exact', true)
  await promisifiedInstall(modules)
}

module.exports = { installModules }
