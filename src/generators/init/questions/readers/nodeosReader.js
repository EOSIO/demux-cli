const utils = require('../utils')
const { commonQuestions } = require('./commonQuestions')

module.exports = {
  choiceName: 'Nodeos API Endpoint (using the http_plugin)',
  value: 'NodeosActionReader',
  questions: [
    {
      type: 'input',
      name: 'nodeosReaderEndpoint',
      message: 'What is the Nodeos RPC URI (specified as --http-server-address in Nodeos settings)?',
      validate: utils.required,
    },
    ...commonQuestions,
  ],
}
