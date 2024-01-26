import { ref, reactive } from 'vue'

function useJustReturnSomething() {
  const counter = ref(0)
  const state = reactive({})
  const rawVal = 0

  return { counter, state, rawVal }
}

export { useJustReturnSomething }
