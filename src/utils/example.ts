import { Emitter } from "./event";

export class Document3 {
  private readonly _onDidChange = new Emitter<string>()
  onDidChange = this._onDidChange.event

  setText(value: string) {
    this._onDidChange.fire(value)
  }
}

export class EventCounter {

  count = 0;

  reset() {
    this.count = 0;
  }

  onEvent() {
    this.count += 1;
  }
}
