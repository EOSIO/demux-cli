const Generator = require('yeoman-generator')
const path = require('path')
const readers = require('./questions/readers')
const handlers = require('./questions/handlers')
const { installModules } = require('./installModules')
const { dependencies: deps } = require('./dependencies')

// Must define methods in a parent class so that they don't automatically run:
// https://yeoman.io/authoring/running-context.html
class InitGenerator extends Generator {
  async init() {
    this.classToPackage = {
      MassiveActionHandler: 'demux-postgres',
      NodeosActionReader: 'demux-eos',
      MongoActionReader: 'demux-eos',
    }
  }

  async ask() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'installationType',
        message: 'Would you like to create a new self-contained Node module, or install demux into an existing module?',
        choices: [
          {
            name: 'New module (package.json will be created)',
            value: 'standalone',
          },
          {
            name: 'Existing module (will install dependencies)',
            value: 'integrated',
          },
        ],
      },
    ])

    if (this.answers.installationType === 'standalone') {
      this.log('Questions for package.json:')
      Object.assign(
        this.answers,
        await this.prompt([
          {
            type: 'input',
            name: 'moduleName',
            message: 'What would you like to name this module?',
            default: this.env.cwd.substring(
              this.env.cwd.lastIndexOf(path.sep) + 1,
              this.env.cwd.length,
            ),
          },
          {
            type: 'input',
            name: 'moduleAuthor',
            message: 'Who is the author for this module?',
          },
          {
            type: 'input',
            name: 'moduleLicense',
            message: 'What should the license be for this module?',
            default: 'MIT',
          },
        ]),
      )
    }

    this.log('Questions about reading blocks:')
    Object.assign(
      this.answers,
      await this.prompt([
        {
          type: 'list',
          name: 'reader',
          message: 'From where do you want to read blocks?',
          choices: readers.choices,
        },
      ]),
    )

    this.log('Questions about storing state:')
    Object.assign(
      this.answers,
      await this.prompt([
        ...readers.questions[this.answers.reader],
        {
          type: 'list',
          name: 'handler',
          message: 'To where do you want to store demux state?',
          choices: handlers.choices,
        },
      ]),
    )

    this.log('Questions about Postgres:')
    Object.assign(
      this.answers,
      await this.prompt(handlers.questions[this.answers.handler]),
    )

    this.log('Final questions:')
    Object.assign(
      this.answers,
      await this.prompt([
        {
          type: 'input',
          name: 'pollInterval',
          message: 'How often do you want to poll for new blocks (in milliseconds)?',
          default: 250,
        },
        {
          type: 'input',
          name: 'endpointPort',
          message: 'At what port do you want to serve your demux endpoint?',
          default: 8282,
        },
      ]),
    )
  }

  async conf() {
    if (this.answers.installationType === 'standalone') {
      this.answers.packageJson = {
        name: this.answers.moduleName,
        version: '0.0.1',
        main: 'run.js',
        author: this.answers.moduleAuthor,
        license: this.answers.moduleLicense,
      }
    }

    this.answers.readerPackage = this.classToPackage[this.answers.reader]
    this.answers.handlerPackage = this.classToPackage[this.answers.handler]

    if (this.answers.handler === 'MassiveActionHandler') {
      this.answers.dbConfig = {
        user: this.answers.postgresUser,
        password: this.answers.postgresPassword,
        host: this.answers.postgresHost,
        port: this.answers.postgresPort,
        database: this.answers.postgresDatabase,
        schema: this.answers.postgresSchema,
      }
    }

    if (this.answers.reader === 'MongoActionReader') {
      const str = this.answers.mongoReaderEndpoint
      const host = str.substring(0, str.lastIndexOf(path.sep))
      const dbName = str.substring(str.lastIndexOf(path.sep) + 1, str.length)
      this.answers.mongoConfig = {
        host,
        dbName,
      }
    }
  }

  async copyToSameDir(paths) {
    for (const _path of paths) {
      const extension = _path.substring(_path.lastIndexOf('.') + 1, _path.length)
      if (extension === 'ejs') {
        const templatedPath = _path.substring(0, _path.lastIndexOf('.'))
        this.fs.copyTpl(
          this.templatePath(_path),
          this.destinationPath(templatedPath),
          this.answers,
        )
      } else {
        this.fs.copy(
          this.templatePath(_path),
          this.destinationPath(_path),
        )
      }
    }
  }

  async initProject() {
    this.destinationRoot(this.env.cwd)
    this.config.set({})

    await this.copyToSameDir([
      path.join('handlerVersions', 'index.ts'),
      path.join('handlerVersions', 'v1', 'index.ts'),
      path.join('handlerVersions', 'v1', 'effects', 'index.ts'),
      path.join('handlerVersions', 'v1', 'effects', 'effect.ts'),
      path.join('handlerVersions', 'v1', 'updaters', 'index.ts'),
      path.join('handlerVersions', 'v1', 'updaters', 'updater.ts'),
      'run.ts.ejs',
      'tsconfig.json',
    ])

    if (this.answers.installationType === 'standalone') {
      this.fs.write(
        this.destinationPath('package.json'),
        JSON.stringify(this.answers.packageJson, null, 2),
      )
    }

    if (this.answers.handler === 'MassiveActionHandler') {
      await this.copyToSameDir([
        path.join('migrationSequences', 'index.ts'),
        path.join('migrationSequences', 'init', 'index.ts'),
        path.join('migrationSequences', 'init', '0000-migration.sql.example'),
      ])

      this.fs.write(
        this.destinationPath(path.join('config', 'dbConfig.json')),
        JSON.stringify(this.answers.dbConfig, null, 2),
      )
    }

    this.fs.write(
      this.destinationPath(path.join('config', 'demuxConfig.json')),
      JSON.stringify(
        {
          // Conditionally add nodeosEndpoint if it exists
          ...this.answers.nodeosReaderEndpoint && { nodeosEndpoint: this.answers.nodeosReaderEndpoint },
          startAtBlock: this.answers.startAtBlock,
          onlyIrreversible: this.answers.onlyIrreversible,
          pollInterval: this.answers.pollInterval,
          endpointPort: this.answers.endpointPort,
        },
        null,
        2,
      ),
    )

    if (this.answers.reader === 'MongoActionReader') {
      this.fs.write(
        this.destinationPath(path.join('config', 'mongoConfig.json')),
        JSON.stringify(this.answers.mongoConfig, null, 2),
      )
    }
  }

  async npmInstall() {
    const dependencies = [
      deps.demux,
    ]

    const devDependencies = [
      deps.typescript,
      deps.typesMassive,
    ]

    if (['MongoActionReader', 'NodeosActionReader'].contains(this.answers.reader)) {
      dependencies.push(deps.demuxEos)
    }
    if (this.answers.handler === 'MassiveActionHandler') {
      dependencies.push(deps.demuxPostgres)
      dependencies.push(deps.massive)
    }

    this.log('Installing node dependencies...')
    await installModules(dependencies)
    this.log('Installing node dev dependencies...')
    await installModules(devDependencies, true)
  }
}

module.exports = class extends InitGenerator {
  async initializing() {
    try {
      await this.init()
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

  async configuring() {
    try {
      await this.conf()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async writing() {
    try {
      await this.initProject()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async install() {
    try {
      await this.npmInstall()
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
