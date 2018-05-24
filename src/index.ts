interface IPerson {
    name: {
        first: string
        last?: string
    }
}

function getName(person: IPerson): string {
    return person.name.first
}

const person: IPerson = {
    name: {
        first: 'John',
        last: 'Doe',
    }
}

// Valid usage of function
// console.log(`First Name: ${getName(person)}`)

// Invalid usage of function
// Will fail with `tsc --noImplicitAny true`
function sayHello(obj) {
    console.log(`Hello, ${getName(obj)}`)
}

sayHello('Mary')
