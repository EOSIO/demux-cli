const AbstractHandlerGenerator = require('../../AbstractHandlerGenerator')

// Must define methods in a parent class so that they don't automatically run:
// https://yeoman.io/authoring/running-context.html
class UpdaterGenerator extends AbstractHandlerGenerator {
  get handlerType() { return 'updater' }

  get questions() {
    return [
      this.contractNameQ,
      this.actionNameQ,
      this.handlerVersionQ,
      this.newHandlerVersionQ,
      this.confirmCreateNewQ,
    ]
  }
}

module.exports = class extends UpdaterGenerator {
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
