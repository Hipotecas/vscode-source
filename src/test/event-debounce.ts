import { Document3 } from "../utils/example"
import { Event } from '../utils/event'
const doc = new Document3()
const onDocDidChange = Event.debounce(doc.onDidChange, (prev: string[] | undefined , cur) => {
  if (!prev) {
    prev = [cur]
  } else if (prev.indexOf(cur) < 0) {
    prev.push(cur)
  }
  return prev
}, 10)

let num = 0
onDocDidChange(keys => {
  num++
  console.log('[ keys ] >', keys)
  if (num === 1) {
    doc.setText('4')
    console.log('[ num === 1, keys ] >', keys)
  } else if (num === 2) {
    console.log('[ num === 2, keys ] >', keys)
  }
})
doc.setText('1')
doc.setText('2')
doc.setText('3')
