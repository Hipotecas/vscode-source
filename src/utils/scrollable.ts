import { Emitter } from "./event"
import { Disposable, IDisposable } from "./lifecycle"

export const enum ScrollbarVisibility {
  Auto = 1,
  Hidden,
  Visible
}

export interface ScrollEvent {
  inSmoothScrolling: boolean

  oldWidth: number
  oldScrollWidth: number
  oldScrollLeft: number

  width: number
  scrollWidth: number
  scrollLeft: number

  oldHeight: number
  oldScrollHeight: number
  oldScrollTop: number

  height: number
  scrollHeight: number
  scrollTop: number

  widthChanged: boolean
  scrollWidthChanged: boolean
  scrollLeftChanged: boolean

  heightChanged: boolean
  scrollHeightChanged: boolean
  scrollTopChanged: boolean
}
export class ScrollState implements IScrollDimensions, IScrollPosition {
  _scrollStateBrand: void = undefined
  readonly rawScrollLeft: number
  readonly rawScrollTop: number
  readonly width: number
  readonly scrollWidth: number;
  readonly scrollLeft: number;
  readonly height: number;
  readonly scrollHeight: number;
  readonly scrollTop: number;
  constructor(
    private readonly _foceIntegerValues: boolean,
    width: number,
    scrollWidth: number,
    scrollLeft: number,
    height: number,
    scrollHeight: number,
    scrollTop: number
  ) {
    if (this._foceIntegerValues) {
      width = width | 0
      scrollWidth = scrollWidth | 0
      scrollLeft = scrollLeft | 0
      height = height | 0
      scrollHeight = scrollHeight | 0
      scrollTop = scrollTop | 0
    }

    this.rawScrollLeft = scrollLeft
    this.rawScrollTop = scrollTop

    if (width < 0) {
      width = 0
    }

    if (scrollLeft + width > scrollWidth) {
      scrollLeft = scrollWidth - width
    }

    if (scrollLeft < 0) {
      scrollLeft = 0
    }

    if (height < 0) {
      height = 0
    }

    if (scrollTop + height > scrollHeight) {
      scrollTop = scrollHeight - height
    }

    if (scrollTop < 0) {
      scrollTop = 0
    }
    this.width = width
    this.scrollWidth = scrollWidth
    this.scrollLeft = scrollLeft
    this.height = height
    this.scrollHeight = scrollHeight
    this.scrollTop = scrollTop
  }
  equals(other: ScrollState) {
    return (
      this.rawScrollLeft === other.rawScrollLeft &&
      this.rawScrollTop === other.rawScrollTop &&
      this.width === other.width &&
      this.scrollWidth === other.scrollWidth &&
      this.scrollLeft === other.scrollLeft &&
      this.height === other.height &&
      this.scrollHeight === other.scrollHeight &&
      this.scrollTop === other.scrollTop
    )
  }
  withScrollDimensions(update: INewScrollDimensions, useRawScrollPositions: boolean): ScrollState {
    return new ScrollState(
      this._foceIntegerValues,
      typeof update.width !== 'undefined' ? update.width : this.width,
      typeof update.scrollWidth !== 'undefined' ? update.scrollWidth : this.scrollWidth,
      useRawScrollPositions ? this.rawScrollLeft : this.scrollLeft,
      typeof update.height !== 'undefined' ? update.height : this.height,
      typeof update.scrollHeight !== 'undefined' ? update.scrollHeight : this.scrollHeight,
      useRawScrollPositions ? this.rawScrollTop : this.scrollTop
    )
  }
  withScrollPosition(update: INewScrollPosition): ScrollState {
    return new ScrollState(
      this._foceIntegerValues,
      this.width,
      this.scrollWidth,
      typeof update.scrollLeft !== 'undefined' ? update.scrollLeft : this.rawScrollLeft,
      this.height,
      this.scrollHeight,
      typeof update.scrollTop !== 'undefined' ? update.scrollTop : this.rawScrollTop
    )
  }

  createScrollEvent(previous: ScrollState, inSmoothScrolling: boolean): ScrollEvent {
    const widthChanged = this.width !== previous.width
    const scrollWidthChanged = this.scrollWidth !== previous.scrollWidth
    const scrollLeftChanged = this.scrollLeft !== previous.scrollLeft
    const heightChanged = this.height !== previous.height
    const scrollHeightChanged = this.scrollHeight !== previous.scrollHeight
    const scrollTopChanged = this.scrollTop !== previous.scrollTop
    return {
      inSmoothScrolling,
      oldWidth: previous.width,
      oldScrollWidth: previous.scrollWidth,
      oldScrollLeft: previous.scrollLeft,
      width: this.width,
      scrollWidth: this.scrollWidth,
      scrollLeft: this.scrollLeft,
      oldHeight: previous.height,
      oldScrollHeight: previous.scrollHeight,
      oldScrollTop: previous.scrollTop,
      height: this.height,
      scrollHeight: this.scrollHeight,
      scrollTop: this.scrollTop,
      widthChanged,
      scrollWidthChanged,
      scrollLeftChanged,
      heightChanged,
      scrollHeightChanged,
      scrollTopChanged
    }
  }
}

export interface IScrollDimensions {
  readonly width: number
  readonly scrollWidth: number
  readonly height: number
  readonly scrollHeight: number
}

export interface IScrollPosition {
  readonly scrollLeft: number
  readonly scrollTop: number
}

export interface INewScrollDimensions {
  readonly width?: number
  readonly scrollWidth?: number
  readonly height?: number
  readonly scrollHeight?: number
}

export interface INewScrollPosition {
  readonly scrollLeft?: number
  readonly scrollTop?: number
}
export interface ISmoothScrollPosition {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly width: number
  readonly height: number
}
export interface IScrollableOptions {

  forceInterValues: boolean

  smoothScrollDuration: number

  scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable
}

export class ScrollAble extends Disposable {

  _smoothScrollDuration: number
  _scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable
  _state: ScrollState
  _smoothScrolling: SmoothScrollingOperation | null
  _onScroll = this._register(new Emitter<ScrollEvent>())
  onScroll = this._onScroll.event

  constructor(options: IScrollableOptions) {
    super()
    this._smoothScrollDuration = options.smoothScrollDuration
    this._scheduleAtNextAnimationFrame = options.scheduleAtNextAnimationFrame
    this._state = new ScrollState(options.forceInterValues, 0, 0, 0, 0, 0, 0)
    this._smoothScrolling = null
  }

  public override dispose(): void {
    if (this._smoothScrolling) {
      this._smoothScrolling.dispose()
      this._smoothScrolling = null
    }
    super.dispose()
  }

  setSmoothScrollDuration(smoothScrollDuration: number) {
    this._smoothScrollDuration = smoothScrollDuration
  }

  validateScrollPosition(scrollPosition: INewScrollPosition): INewScrollPosition {
    return this._state.withScrollPosition(scrollPosition)
  }

  getScrollDimensions(): IScrollDimensions {
    return this._state
  }

  setScrollDimensions(dimensions: INewScrollDimensions) {
    const newState = this._state.withScrollDimensions(dimensions, false)
    this._setState(newState, Boolean(this._smoothScrolling))

    this._smoothScrolling?.acceptScrollDimensions(this._state)
  }

  _setState(newState: ScrollState, inSmoothScrolling: boolean) {
    const oldState = this._state
    if (oldState.equals(newState)) {
      return
    }
    this._state = newState
    this._onScroll.fire(this._state.createScrollEvent(oldState, inSmoothScrolling))
  }

  /**
   * Returns the final scroll position that the instance will have once the smooth scroll animation concludes.
   * If no scroll animation is occurring, it will return the current scroll position instead.
   */
  getFutureScrollPosition(): IScrollPosition {
    if (this._smoothScrolling) {
      return this._smoothScrolling.to
    }
    return this._state
  }

  getCurrentScrollPosition(): IScrollPosition {
    return this._state
  }

  setScrollPositionNow(update: INewScrollPosition) {
    const newState = this._state.withScrollPosition(update)
    if (this._smoothScrolling) {
      this._smoothScrolling.dispose()
      this._smoothScrolling = null
    }
    this._setState(newState, false)
  }

  setScrollPositionSmooth(update: INewScrollPosition, reuseAnimation?: boolean) {
    if (this._smoothScrollDuration === 0) {
      return this.setScrollPositionNow(update)
    }
    if (this._smoothScrolling) {
      update = {
        scrollLeft: typeof update.scrollLeft === 'undefined' ? this._smoothScrolling.to.scrollLeft : update.scrollLeft,
        scrollTop: typeof update.scrollTop === 'undefined' ? this._smoothScrolling.to.scrollTop : update.scrollTop
      }

      const validTarget = this._state.withScrollPosition(update)
      if (this._smoothScrolling.to.scrollLeft === validTarget.scrollLeft && this._smoothScrolling.to.scrollTop === validTarget.scrollTop) {
        return
      }

      let newSmoothScrolling: SmoothScrollingOperation
      if (reuseAnimation) {
        newSmoothScrolling = new SmoothScrollingOperation(this._smoothScrolling.from, validTarget, this._smoothScrolling.startTime, this._smoothScrolling.duration)
      } else {
        newSmoothScrolling = this._smoothScrolling.combine(this._state, validTarget, this._smoothScrollDuration)
      }

      this._smoothScrolling.dispose()
      this._smoothScrolling = newSmoothScrolling
    } else {
      const validTarget = this._state.withScrollPosition(update)
      this._smoothScrolling = SmoothScrollingOperation.start(this._state, validTarget, this._smoothScrollDuration)
    }

    this._smoothScrolling.animationFrameDispoable = this._scheduleAtNextAnimationFrame(() => {
      if (!this._smoothScrolling) {
        return
      }
      this._smoothScrolling.animationFrameDispoable = null
      this._performSmoothScrolling()
    })
  }

  _performSmoothScrolling() {
    if (!this._smoothScrolling) {
      return
    }
    const update = this._smoothScrolling.tick()
    const newState = this._state.withScrollPosition(update)
    this._setState(newState, true)
    if (!this._smoothScrolling) {
      return
    }

    if (update.isDone) {
      this._smoothScrolling.dispose()
      this._smoothScrolling = null
      return
    }
    this._smoothScrolling.animationFrameDispoable = this._scheduleAtNextAnimationFrame(() => {
      if (!this._smoothScrolling) {
        return
      }
      this._smoothScrolling.animationFrameDispoable = null
      this._performSmoothScrolling()
    })
  }

}
interface IAnimation {
  (completion: number): number;
}

export class SmoothScrollingOperation {

  animationFrameDispoable: IDisposable | null
  scrollLeft!: IAnimation
  scrollTop!: IAnimation
  constructor(public from: ISmoothScrollPosition, public to: ISmoothScrollPosition, public startTime: number, public duration: number) {
    this.animationFrameDispoable = null
    this._initAnimations()
  }

  _initAnimations() {
    this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width)
    this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height)
  }

  _initAnimation(from: number, to: number, viewportSize: number) {
    const delta = Math.abs(from - to)
    if (delta > 2.5 * viewportSize) {
      let stop1: number, stop2: number
      if (from < to) {
        stop1 = from + 0.75 * viewportSize
        stop2 = to - 0.5 * viewportSize
      } else {
        stop1 = from - 0.75 * viewportSize
        stop2 = to + 0.5 * viewportSize
      }
      return createComposed(createEaseOutCubic(from, stop1), createEaseOutCubic(stop2, to), 0.33)
    }
    return createEaseOutCubic(from, to)
  }

  dispose() {
    if (this.animationFrameDispoable != null) {
      this.animationFrameDispoable.dispose()
      this.animationFrameDispoable = null
    }
  }

  acceptScrollDimensions(state: ScrollState) {
    this.to = state.withScrollPosition(this.to)
    this._initAnimations()
  }

  tick(): SmoothScrollingUpdate {
    return this._tick(Date.now())
  }

  _tick(now: number): SmoothScrollingUpdate {
    const completion = (now - this.startTime) / this.duration
    if (completion < 1) {
      const newScrollLeft = this.scrollLeft(completion)
      const newScrollTop = this.scrollTop(completion)
      return new SmoothScrollingUpdate(newScrollLeft, newScrollTop, false)
    }
    return new SmoothScrollingUpdate(this.to.scrollLeft, this.to.scrollTop, true)
  }

  combine(from: ISmoothScrollPosition, to: ISmoothScrollPosition, duration: number) {
    return SmoothScrollingOperation.start(from, to, duration)
  }

  static start(from: ISmoothScrollPosition, to: ISmoothScrollPosition, duration: number) {
    duration = duration + 10
    const startTime = Date.now() - 10
    return new SmoothScrollingOperation(from, to, startTime, duration)
  }
}

export class SmoothScrollingUpdate {
  constructor(public scrollLeft: number, public scrollTop: number, public isDone: boolean) { }
}


function createEaseOutCubic(from: number, to: number) {
  const delta = to - from
  return function (completion: number) {
    return from + delta * easeOutCubic(completion)
  }
}
function createComposed(a: IAnimation, b: IAnimation, cut: number): IAnimation {
  return (completion: number) => {
    if (completion < cut) {
      return a(completion / cut)
    }
    return b((completion - cut) / (1 - cut))
  }
}

function easeInCubic(t: number) {
  return Math.pow(t, 3)
}

function easeOutCubic(t: number) {
  return 1 - easeInCubic(1 - t)
}
