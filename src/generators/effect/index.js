/* eslint max-classes-per-file: 0 */
const AbstractHandlerGenerator = require('../../AbstractHandlerGenerator')

// Must define methods in a parent class so that they don't automatically run:
// https://yeoman.io/authoring/running-context.html
class EffectGenerator extends AbstractHandlerGenerator {
  get handlerType() { return 'effect' }

  get questions() {
    return [
      this.contractNameQ,
      this.actionNameQ,
      {
        type: 'list',
        name: 'deferUntilIrreversible',
        message: 'Should this action only run when the block that triggered it becomes irreversible?',
        choices: [
          {
            name: 'Yes',
            value: true,
          },
          {
            name: 'No',
            value: false,
          },
        ],
      },
      this.handlerVersionQ,
      this.newHandlerVersionQ,
      this.confirmCreateNewQ,
    ]
  }
}

module.exports = class extends EffectGenerator {
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
      await this.createHandler()
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
