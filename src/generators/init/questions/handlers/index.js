const { collectChoices, collectQuestions } = require('../utils')

const handlers = [
  // eslint-disable-next-line global-require
  require('./massiveHandler'),
]

module.exports = {
  choices: collectChoices(handlers),
  questions: collectQuestions(handlers),
}
