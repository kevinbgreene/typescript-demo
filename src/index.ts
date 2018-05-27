interface IUser {
    name: string
    age?: number
}

interface IAddress {
    street: string
    city: string
    state: string
}

interface IProfile {
    user: IUser
    address: IAddress
}

type Nullable<T> = {
    [P in keyof T]: T[P] | null
}

type NullableProfile = Nullable<IProfile>

// type Readonly<T> = {
//     readonly [K in keyof T]: T[K]
// }

type List<T> = Readonly<Array<T>>

// type Pick<T, K extends keyof T> = {
//     [P in K]: T[P];
// }

const obj = {
    one: 1,
    two: 2,
    three: 3,
}

function get<T, K extends keyof T>(key: K, obj: T): T[K] {
    return obj[key]
}

get('one', obj)
// get('four', obj)