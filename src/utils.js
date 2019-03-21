const fs = require('fs')
const path = require('path')

const allExists = (paths) => {
  for (const _path of paths) {
    if (!fs.existsSync(_path)) {
      return false
    }
  }
  return true
}

const isDirectory = (file, dirPath) => (
  fs.statSync(path.join(dirPath, file)).isDirectory()
)

const getDirectories = dirPath => fs.readdirSync(dirPath).filter(
  file => isDirectory(file, dirPath),
)

const getCommentIndex = (sourceLines, comment, fileDescription) => {
  const trimmedSourceLines = sourceLines.map(line => line.trim())
  const index = trimmedSourceLines.indexOf(`// ${comment}`)
  if (index === -1) {
    console.error(`The required '// ${comment}' comment is missing from ${fileDescription}.`)
    process.exit(1)
  }
  return index
}

module.exports = {
  allExists,
  getDirectories,
  getCommentIndex,
}
