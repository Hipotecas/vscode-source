import {Emitter, Event} from "../../utils/event";
import {dispose, toDisposable} from "../../utils/lifecycle";

const emitter = new Emitter()
const event = emitter.event

let i = 0
const log: any[] = []
const disposable = Event.runAndSubscribeWithStore(event, (e, disposables) => {
    const idx = i++
    log.push({label: "handleEvent", data: e || null, idx})
    disposables.add(toDisposable(() => {
        log.push({label: 'dispose', idx})
    }))
})

log.push({label: 'fire'})
emitter.fire("someEventData")
disposable.dispose()

console.log(log, 'log')
