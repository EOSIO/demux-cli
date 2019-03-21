/**
 * Exports the MigrationSequences to be used by the MassiveActionHandler. Their names are taken from the names of the
 * directories in this directory.
 *
 * This file is automatically updated via `demux generate migration [sequenceName] [migrationName]` when the
 * provided `sequenceName` does not exist yet and is created.
 */

import { MigrationSequence } from 'demux-postgres'

// IMPORT START
import { init } from './init'
// IMPORT END

export const migrationSequences: MigrationSequence[] = [
  // SEQUENCES START
  {
    sequenceName: 'init',
    migrations: init,
  },
  // SEQUENCES END
]
