/* eslint-disable global-require */
const { collectChoices, collectQuestions } = require('../utils')

const readers = [
  require('./mongoReader'),
  require('./nodeosReader'),
]

module.exports = {
  choices: collectChoices(readers),
  questions: collectQuestions(readers),
}
