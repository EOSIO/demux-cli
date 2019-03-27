const fs = require('fs')
const Generator = require('yeoman-generator')
const path = require('path')
const { orderBy } = require("natural-orderby")
const { allExists, getCommentIndex, getDirectories } = require("../../utils")

// Must define methods in a parent class so that they don't automatically run:
// https://yeoman.io/authoring/running-context.html
class MigrationGenerator extends Generator {
  loadArgs() {
    const [migrationName, migrationSequence] = this.options.args._
    this.answers = {
      migrationName,
      migrationSequence,
    }
    for (const key of Object.keys(this.answers)) {
      if (!this.answers[key]) { continue }
      this.log(`${key}: ${this.answers[key]}`)
    }
  }

  async setup() {
    this.loadArgs()
    const migrationSequencesExist = allExists([this.destinationPath(path.join('migrationSequences', 'index.ts'))])
    if (!migrationSequencesExist) {
      // eslint-disable-next-line quotes
      this.env.error(`This Demux project does not appear to use migrations.`)
    }
    this.migrationSequences = this.getMigrationSequences()
  }

  getMigrationSequences() {
    const migrationSequenceDirs = orderBy(getDirectories(this.destinationPath('migrationSequences')))
    const migrationSequences = migrationSequenceDirs.map(migrationSequence => ({
      name: migrationSequence,
      value: migrationSequence,
    }))
    this.defaultMigrationSequence = migrationSequences[migrationSequences.length - 1].value

    migrationSequences.push({
      name: '[ Create new Migration Sequence ]',
      value: null,
    })
    return migrationSequences
  }

  validateNewMigrationSequence(answer) {
    if (!answer) {
      return 'This field is required.'
    }
    if (!this.confirmNewMigrationSequence(answer, this.migrationSequences)) {
      return `Migration Sequence '${answer}' already exists.`
    }
    return true
  }

  confirmNewMigrationSequence(migrationSequenceName, migrationSequences) {
    if (!migrationSequenceName) { return false }
    for (const migrationSequence of migrationSequences) {
      if (migrationSequence.name === migrationSequenceName) {
        return false
      }
    }
    return true
  }

  checkIfMigrationExists() {
    const { migrationName, migrationSequence } = this.answers
    const newFilePath = path.join(
      'migrationSequences',
      migrationSequence,
      `${migrationName}.sql`,
    )
    if (fs.existsSync(this.destinationPath(newFilePath))) {
      // TODO: Give options to user instead of aborting
      this.env.error(`File at '${newFilePath}' already exists.`)
    }
  }

  async ask() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'migrationName',
        message: 'What should this migration be called? (describe the schema change separated by hyphens)',
        when: !this.answers.migrationName,
      },
      {
        type: 'list',
        name: 'migrationSequence',
        message: 'What Migration Sequence should this be created in?',
        choices: this.migrationSequences,
        when: !this.answers.migrationSequence,
        default: this.defaultMigrationSequence,
      },
      {
        type: 'input',
        name: 'newMigrationSequence',
        message: 'What should the new Migration Sequence be called?',
        when: ans => !this.answers.migrationSequence && !ans.migrationSequence,
        validate: ans => this.validateNewMigrationSequence(ans),
      },
    ])
    if (this.answers.newMigrationSequence) {
      this.answers.isNewMigrationSequence = true
      this.answers.migrationSequence = this.answers.newMigrationSequence
      delete this.answers.newMigrationSequence
    }
    this.checkIfMigrationExists()
  }

  async createMigration() {
    const {
      migrationName,
      migrationSequence,
      isNewMigrationSequence,
    } = this.answers
    const newFilePath = path.join(
      'migrationSequences',
      migrationSequence,
      `${migrationName}.sql`,
    )
    await this.fs.copy(
      this.templatePath('migration.sql.ejs'),
      this.destinationPath(newFilePath),
    )
    if (isNewMigrationSequence) {
      await this.fs.copyTpl(
        this.templatePath('sequenceIndex.ts.ejs'),
        this.destinationPath(path.join(
          'migrationSequences',
          migrationSequence,
          'index.ts',
        )),
        this.answers,
      )
      this.updateSequencesIndex()
    } else {
      this.updateMigrationIndex()
    }
  }

  updateSequencesIndex() {
    try {
      const { migrationSequence } = this.answers
      const indexPath = this.destinationPath(
        path.join(
          'migrationSequences',
          'index.ts',
        ),
      )
      const lines = fs.readFileSync(indexPath).toString().split('\n')
      const importStatement = `import { ${migrationSequence} } from './${migrationSequence}'`
      const sequenceText = `
  {
    sequenceName: '${migrationSequence}',
    migrations: ${migrationSequence},
  },`
      this.insertAboveComment(lines, this.handlerType, 'IMPORT END', importStatement)
      this.insertAboveComment(lines, this.handlerType, 'SEQUENCES END', sequenceText)
      this.fs.write(indexPath, lines.join('\n'))
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  updateMigrationIndex() {
    try {
      const { migrationSequence, migrationName } = this.answers
      const indexPath = this.destinationPath(
        path.join(
          'migrationSequences',
          migrationSequence,
          'index.ts',
        ),
      )
      const lines = fs.readFileSync(indexPath).toString().split('\n')
      const migrationInstantiation = `
  new Migration(
    '${migrationName}',
    dbConfig.schema,
    \`\${__dirname}/${migrationName}.sql\`,
  ),`
      this.insertAboveComment(lines, this.handlerType, 'MIGRATIONS END', migrationInstantiation)
      this.fs.write(indexPath, lines.join('\n'))
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  insertAboveComment(lines, handlerType, comment, toInsert) {
    const descriptionForError = `your ${handlerType}'s index.ts file`
    const endIndex = getCommentIndex(lines, comment, descriptionForError)
    lines.splice(endIndex, 0, toInsert)
  }
}

module.exports = class extends MigrationGenerator {
  async initializing() {
    try {
      await this.setup()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async prompting() {
    try {
      await this.ask()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async writing() {
    try {
      await this.createMigration()
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
