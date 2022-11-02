import { Throttler, timeout } from '../../utils/async'

const throttler = new Throttler()

const factoryFactory = (n: number) => async () => {
  await timeout(0)
  return n
}

const promises: Promise<any>[] = []


promises.push(throttler.queue(factoryFactory(1)).then(n => console.log(n)))

await Promise.all(promises)

