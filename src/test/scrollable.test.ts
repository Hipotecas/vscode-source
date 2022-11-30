import { SmoothScrollingOperation } from "../utils/scrollable";

class TestSmoothScrollingOperation extends SmoothScrollingOperation {
  constructor(from: number, to: number, viewportSize: number, startTime: number, duration: number) {
    duration = duration + 10
    startTime = startTime - 10

    super(
      {scrollLeft: 0, scrollTop: from, width: 0, height: viewportSize},
      {scrollLeft: 0, scrollTop: to, width: 0, height: viewportSize},
      startTime,
      duration
    )
  }

  testTick(now: number) {
    return this._tick(now)
  }
}

const VIEWPORT_SIZE = 800
const LINE_HEIGHT = 20
const ANIMATION_DURATION = 125
function extractLines(scrollable: TestSmoothScrollingOperation, now: number) {
  const scrollTop = scrollable.testTick(now).scrollTop
  const scrollBottom = scrollTop + VIEWPORT_SIZE

  const startLineNumber = Math.floor(scrollTop / LINE_HEIGHT)
  const endLineNumber = Math.ceil(scrollBottom / LINE_HEIGHT)
  return [startLineNumber, endLineNumber]
}

function simulateSmoothScroll(from: number, to: number) {
  const scrollable = new TestSmoothScrollingOperation(from, to, VIEWPORT_SIZE, 0, ANIMATION_DURATION)
  const lines = []
  let i = 0
  lines[i++] = extractLines(scrollable, 0)
  lines[i++] = extractLines(scrollable, 25)
  lines[i++] = extractLines(scrollable, 50)
  lines[i++] = extractLines(scrollable, 75)
  lines[i++] = extractLines(scrollable, 100)
  lines[i++] = extractLines(scrollable, 125)
  return lines
}
console.time('start')
const a = (simulateSmoothScroll(0, 500))
console.log(a);
console.timeEnd('start')
