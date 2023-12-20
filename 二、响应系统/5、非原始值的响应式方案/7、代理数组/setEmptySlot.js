// import { effect } from "./effect/index.js";
// import { reactive } from "./reactive/index.js";

const { effect } = await import("./effect/index.js");
const { reactive } = await import("./reactive/index.js");

const state = reactive(Array(100));

effect(() => {
  console.log(state);
  for (const key in state) {
    if (Object.hasOwnProperty.call(state, key)) {
      const element = state[key];
    }
  }
});

state[50] = "liuyifei";

export {}