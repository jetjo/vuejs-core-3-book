import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('test for App.vue', () => {
  test('render snapshot', () => {
    const wrapper = mount(App)
    expect(wrapper.html()).toMatchFileSnapshot('./__snapshots__/App.snap.html')
  })
})
