import { effect } from "./effect/index.js";
// import { reactive } from "./reactive/index.js";

const { reactive } = await import("./reactive/index.js");
const state = reactive([]);

effect(() => {
  for (const item of state) {
    console.log(item);
  }
});

state.push("刘亦菲");
