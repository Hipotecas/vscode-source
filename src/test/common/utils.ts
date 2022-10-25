import {IDisposable, IDisposableTracker} from "../../utils/lifecycle";

interface DisposableData {
	source: string | null;
	parent: IDisposable | null;
	isSingleton: boolean;
}


export class DisposableTracker implements IDisposableTracker {
  private readonly livingDisposables = new Map<IDisposable, DisposableData>()

  trackDisposable(disposable: IDisposable) {
	  const data = this.getDisposableData(disposable)
	  if (!data.source) {
		  data.source = new Error().stack!
	  }
  }

  setParent(child: IDisposable, parent: IDisposable | null) {
	  const data = this.getDisposableData(child)
	  data.parent = parent
  }

  markAsDisposed(disposable: IDisposable) {
	  this.livingDisposables.delete(disposable)
  }

  markAsSingleton(disposable: IDisposable) {
	  this.getDisposableData(disposable).isSingleton = true
  }

  getTrackedDisposables() {
	  const rootParentCache = new Map<DisposableData, DisposableData>()
	  return [...this.livingDisposables.entries()]
		  .filter(([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)
		  .map(([k]) => k)
		  .flat()
  }

  ensureNoLeakingDisposables() {
	  const rootParentCache = new Map<DisposableData, DisposableData>()
	  const leaking = [...this.livingDisposables.values()]
		  .filter(v => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)

	  if (leaking.length > 0) {
		  const count = 10
		  const firstLeaking = leaking.slice(0, count)
		  const remainingCount = leaking.length - count

		  const separator = '--------------\n\n'

		  let s = firstLeaking.map(l => l.source).join(separator)
		  if (remainingCount > 0) {
			  s += `${separator}+ ${remainingCount} more`
		  }
		  throw new Error(`These disposables were not disposed:\n ${s}`)
	  }
  }

  private getDisposableData(data: IDisposable) {
	  let val = this.livingDisposables.get(data)
	  if (!val) {
		  val = { source: null, parent: null, isSingleton: false }
		  this.livingDisposables.set(data, val)
	  }
	  return val
  }

  private getRootParent(data: DisposableData, cache: Map<DisposableData, DisposableData>): DisposableData {
	  const cacheValue = cache.get(data)
	  if (cacheValue) {
		  return cacheValue
	  }
	  const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data
	  cache.set(data, result)
	  return result
  }
}
