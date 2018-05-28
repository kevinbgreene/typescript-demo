type Brand<K, T> = K & { __brand: T }

type USD = Brand<number, 'USD'>
type EUR = Brand<number, 'EUR'>

const usd = 10 as USD
const eur = 10 as EUR

function euroToUsd(euro: EUR): USD {
    return (euro * 1.18 as USD)
}

type ClearTimeout = Brand<number, 'ClearTimeout'>
type ClearInterval = Brand<number, 'ClearInterval'>

declare function setTimeout(handler: () => void, delay: number): ClearTimeout
declare function setInterval(handler: () => void, delay: number): ClearInterval
declare function clearInterval(scheduled: ClearInterval): void
declare function clearTimeout(scheduled: ClearTimeout): void

const scheduled = setTimeout(() => {}, 1000)
clearInterval(scheduled)

// Commenting or deleting this line will allow clearInterval to compile correctly.
export const foo: string = 'bar'
