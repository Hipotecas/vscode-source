import * as assert from 'assert';
import { Emitter, EventBufferer } from "../utils/event";
import { EventCounter } from "../utils/example";
const bufferer = new EventBufferer()

const counter = new EventCounter()
const emitter = new Emitter<void>()
const event = bufferer.wrapEvent(emitter.event)

const listener = event(counter.onEvent, counter)


assert.strictEqual(counter.count, 0);
emitter.fire();
assert.strictEqual(counter.count, 1);

bufferer.bufferEvents(() => {
  emitter.fire();
  assert.strictEqual(counter.count, 1);
  emitter.fire();
  assert.strictEqual(counter.count, 1);
});

assert.strictEqual(counter.count, 3);
emitter.fire();
assert.strictEqual(counter.count, 4);

listener.dispose();

