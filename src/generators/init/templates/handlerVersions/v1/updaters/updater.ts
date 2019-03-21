/**
 * This is an example Updater. Updaters are provided with a state object by your chosen ActionHandler, which should be
 * used to accumulate data based on the subscribed action's payload. Make sure that your function's logic is
 * deterministic, as it should yield the same results give the same action, payload, and state.
 *
 * Make sure to export one (and only one) Updater object from this file.
 */

import { Updater, BlockInfo, ActionCallback } from 'demux'

const apply: ActionCallback = async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
  // Put your updater code here
}

const updater: Updater = {
  apply,
  actionType: 'contract::action', // The actionType this effect will subscribe to
}

export default updater


