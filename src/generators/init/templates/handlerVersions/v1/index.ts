/**
 * This exports the HandlerVersion, which contains this version's Updaters and Effects.
 *
 * You should only need to change this file if you have changed the name of your HandlerVersion.
 */

import { HandlerVersion } from 'demux'
import { updaters } from './updaters'
import { effects } from './effects'

export const v1: HandlerVersion = {
  versionName: 'v1',
  updaters,
  effects,
}
