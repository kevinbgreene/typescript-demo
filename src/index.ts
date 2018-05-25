class Animal {
    public readonly species: string
    constructor(species: string) {
        this.species = species
    }
}

class Dog extends Animal {
    constructor() {
        super('Dog')
    }
    public bark(): void {
        console.log('Bark! Bark!')
    }
}

class Cat extends Animal {
    constructor() {
        super('Cat')
    }
    public meow(): void {
        console.log('Meeeeoooow')
    }
}

/**
 * Checking for argument type contravariance
 */
type AnimalAction = (animal: Animal) => void

function readSpecies(x: Animal): void {
    console.log(x.species)
}

function makeBark(dog: Dog): void {
    dog.bark()
}

function makeMeow(cat: Cat): void {
    cat.meow()
}

// With `tsc --strictFunctionTypes true` this will fail
const action: AnimalAction = makeBark

action(new Cat())
