type Reducer<T,E> = (acc: T, next: E) => T

function reduce<T>(reducer: Reducer<T,T>, arr: Array<T>): T
function reduce<T>(reducer: Reducer<T,T>, initialValue: T, arr: Array<T>): T
function reduce<U,T>(reducer: Reducer<U,T>, initialValue: U, arr: Array<T>): U
function reduce<U,T>(...args: Array<any>): U {
    if (args.length === 3) {
        const reducer: Reducer<U,T> = args[0]
        const collection: Array<T> = args[2]
        const len: number = collection.length
        let index: number = 0
        let result: U = args[1]

        while (index < len) {
            result = reducer(result, collection[index])
            index++
        }

        return result

    } else {
        const reducer: Reducer<U,U> = args[0]
        const collection: Array<U> = args[1]
        const len: number = collection.length
        let index: number = 0
        let result: U = collection[index++]

        while (index < len) {
            result = reducer(result, collection[index])
            index++
        }

        return result
    }
}

console.log(reduce((acc, next) => acc + next, 0, [ 1, 2, 3 ]))
console.log(reduce((acc, next) => acc + next, [ 1, 2, 3 ]))

class List<T> {
    private items: Array<T> = []
    private length: number = 0
    constructor(items: Array<T>) {
        for (const item of items) {
            this.items.push(item)
        }

        this.length = this.items.length
    }

    reduce(reducer: Reducer<T,T>): T
    reduce(reducer: Reducer<T,T>, initialValue: T): T
    reduce<U>(reducer: Reducer<U,T>, initialValue: U): U
    reduce<U>(...args: Array<any>): any {
        if (args.length === 2) {
            const reducer: Reducer<U,T> = args[0]
            const len: number = this.items.length
            let index: number = 0
            let result: U = args[1]

            while (index < len) {
                result = reducer(result, this.items[index])
                index++
            }

            return result

        } else {
            const reducer: Reducer<T,T> = args[0]
            const len: number = this.items.length
            let index: number = 0
            let result: T = this.items[index++]

            while (index < len) {
                result = reducer(result, this.items[index])
                index++
            }

            return result
        }
    }
}

const list: List<number> = new List([1, 2, 3 ])
console.log(list.reduce((acc, next) => acc + next))
