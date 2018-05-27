interface IPerson {
    name: string
}

interface IEmployee {
    name: string
}

interface IPersonDesc {
    age: number
    email: string
}

function getName(obj: IPerson): string {
    return obj.name
}

const user: IPerson = {
    name: 'Larry Sanders',
}

const employee: IEmployee = user

const employee2: IEmployee = {
    name: 'Bob Marley',
}

getName(employee2)

// This will cause a type error
// const person: IPerson = {
//     name: 'Carly Simon',
//     age: 72,
//     email: 'carly@fake.com',
// }

const person: IPerson & IPersonDesc = {
    name: 'Carly Simon',
    age: 72,
    email: 'carly@fake.com',
}

const person2: IPerson = person

interface IUser {
    name: string
}

const names: Array<string> = [ 'Bart', 'Homer', 'Marge', 'Lisa' ]

// This works
// const users: Array<IUser> = names.map((name, index) => ({
//    name,
//    id: index
// }))

// This won't work
const users: Array<IUser> = names.map((name, index): IUser => ({
    name,
    id: index,
}))

// This won't work
// const users: Array<IUser> = names.map((name, index) => ({
//     id: index,
// }))