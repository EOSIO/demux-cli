const Generator = require('yeoman-generator')
const { orderBy } = require('natural-orderby')
const path = require('path')
const fs = require('fs')
const { getDirectories, allExists, getCommentIndex } = require('./utils')


class AbstractHandlerGenerator extends Generator {
  get handlerType() { throw new Error('Must define "handlerType" get method.') }

  get questions() { throw new Error('Must define "questions" get method.') }

  get contractNameQ() {
    return {
      type: 'input',
      name: 'contractName',
      message: 'What is the name of the contract?',
      when: !this.answers.contractName,
    }
  }

  get actionNameQ() {
    return {
      type: 'input',
      name: 'actionName',
      message: 'What is the name of the action?',
      when: !this.answers.actionName,
    }
  }

  get handlerVersionQ() {
    return {
      type: 'list',
      name: 'handlerVersion',
      message: 'What Handler Version should this be created in?',
      choices: this.handlerVersions,
      when: !this.answers.handlerVersion,
      default: this.defaultHandlerVersion,
    }
  }

  get newHandlerVersionQ() {
    return {
      type: 'input',
      name: 'newHandlerVersion',
      message: 'What should the new Handler Version be called?',
      when: ans => !this.answers.handlerVersion && !ans.handlerVersion,
      validate: ans => this.validateNewHandlerVersion(ans),
    }
  }

  get confirmCreateNewQ() {
    return {
      type: 'confirm',
      name: 'confirmCreateNew',
      message: `Confirm creation of new Handler Version '${this.answers.handlerVersion}'?`,
      when: () => this.answers.isNewHandlerVersion,
    }
  }

  async ask() {
    Object.assign(
      this.answers,
      await this.prompt(this.questions),
    )
    if (this.answers.newHandlerVersion) {
      this.answers.isNewHandlerVersion = true
      this.answers.handlerVersion = this.answers.newHandlerVersion
      delete this.answers.newHandlerVersion
    }
    this.answers.newHandlerTypeDirectory = !this.handlerTypeExists()
    this.checkIfHandlerExists()
  }

  handlerTypeExists(handlerType = this.handlerType) {
    const { handlerVersion } = this.answers
    return fs.existsSync(
      this.destinationPath(
        path.join(
          'handlerVersions',
          handlerVersion,
          `${handlerType}s`,
          'index.ts',
        ),
      ),
    )
  }

  checkIfHandlerExists() {
    const { handlerVersion, contractName, actionName } = this.answers
    const newFilePath = path.join(
      'handlerVersions',
      handlerVersion,
      `${this.handlerType}s`,
      contractName,
      `${actionName}.ts`,
    )
    if (fs.existsSync(this.destinationPath(newFilePath))) {
      // TODO: Give options to user instead of aborting
      this.env.error(`File at '${newFilePath}' already exists.`)
    }
  }

  loadArgs() {
    const [contractName, actionName, handlerVersion] = this.options.args._
    this.answers = {
      contractName,
      actionName,
      handlerVersion,
    }
    for (const key of Object.keys(this.answers)) {
      if (!this.answers[key]) { continue }
      this.log(`${key}: ${this.answers[key]}`)
    }
  }

  getHandlerVersions() {
    const handlerVersionDirs = orderBy(getDirectories(this.destinationPath('handlerVersions')))
    const handlerVersions = handlerVersionDirs.map(handlerVersion => ({
      name: handlerVersion,
      value: handlerVersion,
    }))
    this.defaultHandlerVersion = handlerVersions[handlerVersions.length - 1].value

    handlerVersions.push({
      name: '[ Create new Handler Version ]',
      value: null,
    })
    return handlerVersions
  }

  setup() {
    this.loadArgs()
    const handlerVersionsExist = allExists([this.destinationPath(path.join('handlerVersions', 'index.ts'))])
    if (!handlerVersionsExist) {
      // eslint-disable-next-line quotes
      this.env.error(`This Demux project is not initialized properly. Are you sure you're in the right directory?`)
    }
    this.handlerVersions = this.getHandlerVersions()
    this.answers.isNewHandlerVersion = this.confirmNewHandlerVersion(this.answers.handlerVersion, this.handlerVersions)
  }

  confirmNewHandlerVersion(handlerVersionName, handlerVersions) {
    if (!handlerVersionName) { return false }
    for (const handlerVersion of handlerVersions) {
      if (handlerVersion.name === handlerVersionName) {
        return false
      }
    }
    return true
  }

  validateNewHandlerVersion(answer) {
    if (!answer) {
      return 'This field is required.'
    }
    if (!this.confirmNewHandlerVersion(answer, this.handlerVersions)) {
      return `Handler Version '${answer}' already exists.`
    }
    return true
  }

  insertAboveComment(lines, handlerType, comment, toInsert) {
    const descriptionForError = `your ${handlerType}'s index.ts file`
    const endIndex = getCommentIndex(lines, comment, descriptionForError)
    lines.splice(endIndex, 0, toInsert)
  }

  formatImportName(contractName, actionName) {
    return `${contractName}${actionName[0].toUpperCase()}${actionName.slice(1)}`
  }

  async createHandler() {
    const {
      handlerVersion,
      contractName,
      actionName,
      isNewHandlerVersion,
      newHandlerTypeDirectory,
    } = this.answers
    const newFilePath = path.join(
      'handlerVersions',
      handlerVersion,
      `${this.handlerType}s`,
      contractName,
      `${actionName}.ts`,
    )
    await this.fs.copyTpl(
      this.templatePath(`${this.handlerType}.ts.ejs`),
      this.destinationPath(newFilePath),
      this.answers,
    )
    if (isNewHandlerVersion || newHandlerTypeDirectory) {
      this.createHandlerIndex()
      this.updateHandlerVersionsIndex()
    } else {
      this.updateHandlerIndex()
    }
    this.createHandlerVersionIndex()
  }

  createHandlerIndex() {
    const { contractName, actionName, handlerVersion } = this.answers
    const handlerIndexPath = path.join('handlerVersions', handlerVersion, `${this.handlerType}s`, 'index.ts')
    const importName = this.formatImportName(contractName, actionName)
    const importPath = `./${contractName}/${actionName}`
    this.fs.copyTpl(
      this.templatePath('handlerIndex.ts.ejs'),
      this.destinationPath(handlerIndexPath),
      { handlerVersion, importName, importPath },
    )
  }

  updateHandlerIndex() {
    try {
      const { handlerVersion, contractName, actionName } = this.answers
      const indexPath = this.destinationPath(
        path.join(
          'handlerVersions',
          handlerVersion,
          `${this.handlerType}s`,
          'index.ts',
        ),
      )
      const lines = fs.readFileSync(indexPath).toString().split('\n')
      const importName = this.formatImportName(contractName, actionName)
      const importStatement = `import ${importName} from './${contractName}/${actionName}'`
      const exportStatement = `  ${importName},`
      this.insertAboveComment(lines, this.handlerType, 'IMPORT END', importStatement)
      this.insertAboveComment(lines, this.handlerType, 'ARRAY ITEMS END', exportStatement)
      this.fs.write(indexPath, lines.join('\n'))
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  createHandlerVersionIndex() {
    const { handlerVersion } = this.answers
    const handlerVersionIndexPath = this.destinationPath(
      path.join(
        'handlerVersions',
        handlerVersion,
        'index.ts',
      ),
    )
    const hasUpdaters = this.handlerType === 'updater' || this.handlerTypeExists('updater')
    const hasEffects = this.handlerType === 'effect' || this.handlerTypeExists('effect')
    this.fs.copyTpl(
      this.templatePath('handlerVersionIndex.ts.ejs'),
      this.destinationPath(handlerVersionIndexPath),
      { hasUpdaters, hasEffects, handlerVersion },
    )
  }

  updateHandlerVersionsIndex() {
    const { handlerVersion } = this.answers
    const indexPath = this.destinationPath(path.join('handlerVersions', 'index.ts'))
    const lines = fs.readFileSync(indexPath).toString().split('\n')
    const importStatement = `import { ${handlerVersion} } from './${handlerVersion}'`
    const exportStatement = `  ${handlerVersion},`
    this.insertAboveComment(lines, this.handlerType, 'IMPORT END', importStatement)
    this.insertAboveComment(lines, this.handlerType, 'ARRAY ITEMS END', exportStatement)
    this.fs.write(indexPath, lines.join('\n'))
  }
}

module.exports = AbstractHandlerGenerator
