import getGetTrap from './get.js'
import getSetTrap from './set.js'
import getOwnKeysTrap from './ownKeys.js'
import getHasTrap from './has.js'
import getDeleteTrap from './deleteProperty.js'

export const trapGetters = [
  getGetTrap,
  getSetTrap,
  getOwnKeysTrap,
  getHasTrap,
  getDeleteTrap
]
