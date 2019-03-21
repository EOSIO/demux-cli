/**
 * Export effects here.
 *
 * This file is automatically updated when using `demux generate effect [contract] [action] v1`. The only changes you may want
 * to make are the order of the items between `ARRAY ITEMS START` and `ARRAY ITEMS END`, as this will be the order in
 * which they execute. Keep in mind, however, that effects are run asynchronously, and do not wait for one to finish
 * before starting the next.
 */

// IMPORT START
import exampleEffect from './effect'
// IMPORT END

export const effects = [
  // ARRAY ITEMS START
  exampleEffect,
  // ARRAY ITEMS END
]
