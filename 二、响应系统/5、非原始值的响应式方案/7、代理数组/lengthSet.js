import { effect } from "./effect/index.js";
import { reactive } from "./reactive/index.js";
const state = reactive([]);

effect(() => {
  console.log(state.length);
});

state.length = 100;
