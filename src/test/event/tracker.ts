import {Emitter, Event} from "../../utils/event";
import {DisposableStore, IDisposable, setDisposableTracker} from "../../utils/lifecycle";
import {DisposableTracker} from "../common/utils";


let tracker = new DisposableTracker()

function assertDisposablesCount(expected: number | IDisposable[]) {
    if (Array.isArray(expected)) {
        const instance = new Set(expected)
        const actualInstance = tracker.getTrackedDisposables()
        console.log(actualInstance.length, expected.length);

        for (const item of actualInstance) {
            console.log(instance.has(item));
        }
    } else {
        console.log("num,", tracker.getTrackedDisposables().length, expected);
    }
}

setDisposableTracker(tracker)
const store = new DisposableStore()
const emitter = new Emitter<number>()
const evens = Event.filter(emitter.event, n => n % 2 === 0, store)
assertDisposablesCount(1)
let all = 0
const leaked = evens(n => all += n)
assertDisposablesCount(30)
assertDisposablesCount([leaked])

setDisposableTracker(null)
