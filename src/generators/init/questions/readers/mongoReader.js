const utils = require('../utils')
const { commonQuestions } = require('./commonQuestions')

module.exports = {
  choiceName: 'Nodeos MongoDB (using the mongo_db_plugin)',
  value: 'MongoActionReader',
  questions: [
    {
      type: 'input',
      name: 'mongoReaderEndpoint',
      message: 'What is the MongoDB URI (specified as --mongodb-uri in Nodeos settings)?',
      validate: utils.required,
    },
    ...commonQuestions,
  ],
}
