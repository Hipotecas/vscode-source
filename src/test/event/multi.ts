import {Emitter, EventMultiplexer} from "../../utils/event";

const result: number[] = [];
const m = new EventMultiplexer<number>();
m.event(r => result.push(r));

const e1 = new Emitter<number>();
m.add(e1.event);

console.log(result, []);

e1.fire(0);
console.log(result, [0]);

e1.dispose();
console.log(result, [0]);

e1.fire(0);
console.log(result, [0]);
