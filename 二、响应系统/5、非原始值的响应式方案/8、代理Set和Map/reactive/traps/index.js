import getGetTrap from './get.js'
import getSetTrap from './set.js'
import getDeleteTrap from './deleteProperty.js'
import getHasTrap from './has.js'
import getOwnKeysTrap from './ownKeys.js'

export const trapGetters = [
  getGetTrap,
  getSetTrap,
  getDeleteTrap,
  getHasTrap,
  getOwnKeysTrap
]
