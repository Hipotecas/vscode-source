import {Emitter, Relay} from "../../utils/event";

const e1 = new Emitter<number>()
const e2 = new Emitter<number>()

const relay = new Relay<number>()

const result: number[] = []
const listener = (num: number) => result.push(num)

const subscription = relay.event(listener)
e1.fire(1)
console.log(result)
relay.input = e1.event
e1.fire(2)
console.log(result)

relay.input = e2.event
e1.fire(3)
e2.fire(4)
console.log(result)
subscription.dispose()
e1.fire(5)
e2.fire(6)
console.log(result)
