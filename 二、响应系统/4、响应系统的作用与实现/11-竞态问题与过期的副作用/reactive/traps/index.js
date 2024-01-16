import { getGetTrap } from './get.js'
import { getSetTrap } from './set.js'
import { getOwnKeysTrap } from './ownKeys.js'

export const trapGetters = [getGetTrap, getSetTrap, getOwnKeysTrap]
