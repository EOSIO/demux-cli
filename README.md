# demux-cli ![EOSIO Alpha](https://img.shields.io/badge/EOSIO-Alpha-blue.svg)

CLI tool for starting, developing, and interacting with [demux-js](https://github.com/EOSIO/demux-js) projects.

## Installation

```bash
$ yarn global add demux-cli
```   
Or alternatively,
```bash
$ npm install -g demux-cli
```

## Usage

To see usage documentation, simply call `demux` with no arguments:
```bash
$ demux

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

    demux generate [migration] [migration_name] [migration_sequence]
        Adds a new migration. automatically wiring all needed exports.
        If any arguments are omitted, questions will be asked for the needed
        information. The command requires that you are using the
        MassiveActionHandler, provided by demux-postgres.
```

## Contributing

[Contributing Guide](./CONTRIBUTING.md)

[Code of Conduct](./CONTRIBUTING.md#conduct)

## License

[MIT](./LICENSE)

## Important

See [LICENSE](./LICENSE) for copyright and license terms.

All repositories and other materials are provided subject to the terms of this [IMPORTANT](./IMPORTANT.md) notice and you must familiarize yourself with its terms.  The notice contains important information, limitations and restrictions relating to our software, publications, trademarks, third-party resources, and forward-looking statements.  By accessing any of our repositories and other materials, you accept and agree to the terms of the notice.
