import { ref, shallowReadonlyRef } from '@jetjo/vue3/ref'
import { REF__VALUE_KEY } from './convention.sl.js'
import {
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG,
  VERSION_FLAG
} from '#reactive-convention/4-11.js'

const {
  [SHALLOW_REACTIVE_FLAG]: isShallow,
  [READONLY_REACTIVE_FLAG]: isReadonly,
  [VERSION_FLAG]: version
} = shallowReadonlyRef({}).value
