#! /usr/bin/env node

const findUp = require('find-up')
const parseArgs = require('minimist')
const path = require('path')
const yeoman = require('yeoman-environment')


const env = yeoman.createEnv()

const showHelp = () => {
  console.info(`
Usage:

    demux init
        Initializes a new demux project in the current directory via
        initialization wizard. 

    demux generate updater [contract_name] [action_name] [handler_version]
        Adds a new updater, automatically wiring all needed exports.
        If any arguments are omitted, questions will be asked for the needed
        information.
        
    demux generate effect [contract_name] [action_name] [handler_version]
        Adds a new effect, automatically wiring all needed exports.
        If any arguments are omitted, questions will be asked for the needed
        information.
        
    demux generate migration [migration_name] [migration_sequence]
        Adds a new migration. automatically wiring all needed exports.
        If any arguments are omitted, questions will be asked for the needed
        information. The command requires that you are using the
        MassiveActionHandler, provided by demux-postgres.
`)
}

// Included here instead of depending on strip-ansi
const stripAnsi = (input) => {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|')
  const regex = new RegExp(pattern, 'g')
  return input.replace(regex, '')
}

const isMissingGeneratorError = (err) => {
  const stripped = stripAnsi(err.message)
  // eslint-disable-next-line quotes
  return stripped.startsWith(`You don't seem to have a generator with the name`)
}

const findRootDir = () => {
  // Find the destinationPath ourselves to avoid standard verbose Yeoman logs and fail early
  const initCwd = process.env.INIT_CWD || process.env.PWD
  const found = findUp.sync('.yo-rc.json', { cwd: initCwd })
  if (found) {
    return path.dirname(found)
  }
  return initCwd
}

const run = () => {
  const firstArg = process.argv[2]

  let generator
  let rawArgs = []
  if (firstArg === 'generate') {
    // eslint-disable-next-line prefer-destructuring
    generator = process.argv[3]
    rawArgs = process.argv.slice(4)
  } else if (firstArg === 'init') {
    generator = 'init'
    rawArgs = process.argv.slice(3)
  }

  if (!generator) {
    if (firstArg) {
      console.error('Invalid command.')
    }
    showHelp()
    return
  }

  const args = parseArgs(rawArgs)
  console.info(`${generator} ${rawArgs.join(' ')}`.trim())

  if (generator) {
    env.lookup(() => {
      try {
        const rootDir = findRootDir()
        if (!rootDir) { return }
        env.cwd = rootDir
        env.run(
          [path.join(path.dirname(__filename), '..', 'src', 'generators', generator)],
          { args, rawArgs },
          () => { console.info('All done!') },
        )
      } catch (err) {
        if (isMissingGeneratorError(err)) {
          console.error('Invalid command.')
          showHelp()
          return
        }
        throw err
      }
    })
  }
}

run()
