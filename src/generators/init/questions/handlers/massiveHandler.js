const utils = require('../utils')

module.exports = {
  choiceName: 'Postgres Database',
  value: 'MassiveActionHandler',
  questions: [
    {
      type: 'input',
      name: 'postgresHost',
      message: 'What is the Postgres host URI (excluding port)?',
      default: 'localhost',
    },
    {
      type: 'input',
      name: 'postgresPort',
      message: 'What is the Postgres host port?',
      default: 5432,
      validate: port => (Number.isInteger(port) ? true : 'Invalid port.'),
    },
    {
      type: 'input',
      name: 'postgresDatabase',
      message: 'What is the Postgres database name?',
      default: 'postgres',
    },
    {
      type: 'input',
      name: 'postgresUser',
      message: 'What is the Postgres username?',
      validate: utils.required,
    },
    {
      type: 'password',
      name: 'postgresPassword',
      message: 'What is the Postgres password?',
      validate: answer => (utils.required(answer) === true ? true : 'User without password is not allowed.'),
    },
    {
      type: 'input',
      name: 'postgresSchema',
      message: 'What is the Postgres schema name?',
      default: 'public',
    },
  ],
}
