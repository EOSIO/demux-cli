/**
 * This exports an array of HandlerVersions, to be consumed by your chosen ActionHandler implementation.
 *
 * This file is automatically updated by the `demux generate handlerVersion [ version name ]` command.
 */

import { HandlerVersion } from 'demux'
// IMPORT START
import { v1 } from './v1'
// IMPORT END

export const handlerVersions: HandlerVersion[] = [
  // ARRAY ITEMS START
  v1,
  // ARRAY ITEMS END
]
