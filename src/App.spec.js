import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

console.log(import.meta.env.NODENV_VERSION, 'nodejs版本号')

describe('test for App.vue', () => {
  test('render snapshot', () => {
    const wrapper = mount(App)
    expect(wrapper.html()).toMatchFileSnapshot('./__snapshots__/App.snap.html')
  })
})
