interface IUser {
    name: string
}

function getName(obj: IUser): string {
    return obj.name
}

const user: IUser | null = null

if (user !== null) {
    console.log(`Name: ${getName(user)}`)
} else {
    console.log('User is missing')
}