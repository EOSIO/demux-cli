module.exports = {
  required: answer => (answer ? true : 'This field is required.'),

  collectQuestions: conditionalSurvey => conditionalSurvey.reduce((q, reader) => {
    const questions = JSON.parse(JSON.stringify(q)) // deep clone
    questions[reader.value] = reader.questions
    return questions
  }, {}),

  collectChoices: conditionalSurvey => conditionalSurvey.map(reader => ({
    name: reader.choiceName,
    value: reader.value,
  })),
}
