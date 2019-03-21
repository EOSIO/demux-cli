module.exports = {
  commonQuestions: [
    {
      type: 'input',
      name: 'startAtBlock',
      message: 'At what block number would you like to start processing blocks?',
      default: 1,
    },
    {
      type: 'list',
      name: 'onlyIrreversible',
      message: 'I would like my demux instance to read:',
      choices: [
        {
          name: 'New blocks as soon as they are created',
          value: false,
        },
        {
          name: 'Only irreversible blocks',
          value: true,
        },
      ],
    },
  ],
}
