import { arrayCopyMethods } from './copy.js'

const { checkIfEndlessTrigger } = arrayCopyMethods[1]

checkIfEndlessTrigger.call(
  arrayCopyMethods[1],
  { target: 3, start: 4, end: 6 },
  { target: 2, start: 4, end: 7 }
)
checkIfEndlessTrigger.call(
  arrayCopyMethods[1],
  { target: 5, start: 4, end: 6 },
  { target: 5, start: 3, end: 6 }
)
