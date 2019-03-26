/**
 * This is an example SQL file, inside the `init` directory. All files inside this directory ending in `.sql` will
 * automatically run when demux initializes Postgres.
 *
 * Create additional directories with SQL files inside of them to create new `migrationSequences` available from within
 * your Updater#apply function through `state.migrate(<directory name>)`
 *
 * Table names must be prefixed with ${schema~} as demonstrated below.
 */

CREATE TABLE ${schema~}.todo (
  id int PRIMARY KEY,
  name text NOT NULL
);
