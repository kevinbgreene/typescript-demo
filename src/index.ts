// Will fail with `tsc --noImplicitThis true`
function getObjectName(): string {
    return this.name
}

// This is allowed because we have limited what 'this' can be
// function getObjectName(this: { name: string }): string {
//     return this.name
// }

const person = {
    name: 'Louis',
    getName: getObjectName,
}

const thing = {
    getName: getObjectName,
}

person.getName()

// Will fail with `tsc --noImplicitThis true`
thing.getName()