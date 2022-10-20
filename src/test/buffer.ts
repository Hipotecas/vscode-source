import assert from "assert";
import { Emitter, Event } from "../utils/event";

const result: number[] = [];
const emitter = new Emitter<number>();
const event = emitter.event;
// 缓冲事件
const bufferedEvent = Event.buffer(event);

emitter.fire(1);
emitter.fire(2);
emitter.fire(3);
assert.deepStrictEqual(result, [] as number[]);

const listener = bufferedEvent(num => result.push(num));
assert.deepStrictEqual(result, [1, 2, 3]);

emitter.fire(4);
assert.deepStrictEqual(result, [1, 2, 3, 4]);

listener.dispose();
emitter.fire(5);
assert.deepStrictEqual(result, [1, 2, 3, 4]);
