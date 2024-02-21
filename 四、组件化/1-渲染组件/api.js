import { factory } from '@jetjo/vue3-chapter3'

const VER = '4-1'

/**@type {typeof factory} */
// @ts-ignore
const factory2 = function (option) {
  const config = factory(option)
  config.version = VER
  return config
}

factory2.version = VER

export default factory2
