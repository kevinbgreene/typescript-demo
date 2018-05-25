A quick note before we get into it: All of the examples in this post use TypeScript v2.8.3. If you see different behavior check your version. I will try to update examples from time-to-time with TypeScript updates.

## Introduction

What exactly is this post about? Is this a getting started with TypeScript post? Kind of. I’m calling this a getting started with assumptions, more of a survival guide. The assumptions I am going to make are that you are familiar with JavaScript and the associated ecosystem and that you are familiar with at least one statically-typed language (Java, Scala, Swift…). I won’t be explaining anything around the JavaScript ecosystem and I won’t be covering with any depth TypeScript features that are intuitive and/or consistent with other statically-typed languages. You will notice that a lot of TypeScript's notation will feel very similar to Java or C#. I will be covering areas where TypeScript doesn't behave as you would assume coming from those languages however.

I describe this more as a survival guide because we will be looking specifically at the features and inconsistencies in TypeScript that I have seen cause people the most trouble. Because of TypeScript’s integrations with JavaScript you typically cannot rely on getting the same safety you get from other statically-typed languages in addition there are complexities to integrating with JavaScript you have to consider.

After looking at some of the most common problems with TypeScript we will talk a look at some of the features that are unique to TypeScript or (I feel) underutilized in TypeScript. The features we will look at are ones that will give you more expressive power over your types, making it possible for you to more accurately express what your applications is doing through the type-system. The more accurately you can express statically what your application is doing the more helpful the compiler will become.

### What Is TypeScript?

Even though this isn't purely a getting started walk-through of TypeScript, I want to define TypeScript in something of a practical sense. I find the practical usage of TypeScript to be a little more nuanced than the official definition. Before I start pulling it apart, here is the official definition of TypeScript:

TypeScript is a statically-typed superset of JavaScript - typescirptlang.org
In practice I do not find this definition to accurately define how you should think about TypeScript. When you first download TypeScript and start compiling code I think it is best to think about TypeScript as occupying the same space as ESLint in your work flow. In fact it's probably not even as big of an asset as ESLint. Don't rely on it to be perfect, at best it is going to point out a few areas where your types may not line up and thus could cause errors. It will miss a lot. It's default behavior does not make it a good tool for providing type-safety in your code.

I think of TypeScript as having two definitions depending on how it is configured and how you are using it:

As a linting layer on top of your JavaScript that will help you find some suspicious code.
As its own programming language that compiles to JavaScript (more in line with the official
We are going to look at how to make TypeScript better than this. By the end we will have configured TypeScript and mastered the features that allow us to provide strong type-guarantees in our code.

## Getting Set Up

The form of this post is more as a workshop. It’s meant for you to work along and see things in action. So, I am going to start from nothing. From nothing, or from my terminal window, I am going to start with these commands.

```sh
$ mkdir typescript-demo
$ cd typescript-demo
$ npm init
$ git init
$ touch .gitignore
$ touch tsconfig.json
$ mkdir src
```

So, I've got a new directory. I have a package.json and I have a tsconfig.json (empty). I also have a directory for us to write some code in (src).

The next thing I am going to do is install TypeScript.

```sh
$ npm install --save-dev typescript
```

Now that we have a local (to our project) copy of TypeScript I am going to set up my package.json with scripts to run TypeScript. We're going to keep this very vanilla and build up.

```json
{
    "name": "typescript-demo",
    "version": "1.0.0",
    "description": "",
    "scripts": {
        "clean": "rm -rf build",
        "prebuild": "npm run clean",
        "build": "tsc",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "Kevin B. Greene",
    "license": "Apache-2.0",
    "devDependencies": {
        "typescript": "^2.8.3"
    }
}
```

All I've really done here is make it so "npm run build" will run tsc (the TypeScript compiler).

From here we need to set up our initial configuration for TypeScript, which means we move over to tsconfig.json.

```json
{
    "compilerOptions": {
        "target": "es2015",
        "module": "commonjs",
        "moduleResolution": "node",
        "pretty": true,
        "removeComments": true,
        "rootDir": "./src",
        "outDir": "./build"
    },
    "exclude": [ "node_modules" ]
}
```

Again, this is a pretty minimal config. The important bits are that we are building from the "./src" directory to the "./build" directory.

The final thing we are going to do is add a file to write our code.

```sh
$ touch src/index.ts
```

Cool, an empty file, we're ready to write some code.

## Part 1: Problems and Inconsistencies

Diving into Part 1, we are going to explore some of the areas in which TypeScript will most often cause people problems. Some of these problems are subtle, your code will compile fine, it will often run fine for a while, then BOOM, a runtime error and a nasty stack trace for something any decent type-system should have caught at compile-time. Don't worry, very soon we will have a much stronger tool at our disposal.

### Implicit Casting to Any

To get things going let's take a look at a piece of working TypeScript code.

```typescript
interface IPerson {
    name: {
        first: string
        last?: string
    }
}

function getName(person: IPerson): string {
    return person.name.first
}
```

So, we start off with a couple of definitions, one for an interface and one for a function that knows how to get the value of a property from an object of that interface. We can then use this interface and function in a rather logical way.

```typescript
const person: IPerson = {
    name: {
        first: 'John',
        last: 'Doe',
    }
}

console.log(`First Name: ${getName(person)}`)
```

Everything here is okay. We can compile and run this and get the expected result.

```sh
$ npm run build
$ node build/index.js
First Name: John
```

Problems arise however if we call the getName function in a different context. Let's replace the "console.log(...)" in our previous example with something that is obviously wrong.

```typescript
function sayHello(obj) {
    console.log(`Hello, ${getName(obj)}`)
}

sayHello('Mary')
```

Now, let's try to build and run this.

```sh
$ npm run build
$ node build/index.js
TypeError: Cannot read property 'first' of undefined
```

Okay, everything compiles without a problem, but when we run it there is JavaScript runtime error and a stack trace. Why am I even using TypeScript? I give up.

This is probably the number one problem I have seen people have with TypeScript. They will stare at a function that is throwing errors, in this case our getName function, look at it and wonder how is this error possible. Nothing that is not of the type IPerson should ever be in this function and any object that is of that interface should have a name property.

All of these thoughts make sense. The problem arises in the way that TypeScript behaves by default. If it cannot figure out what the type of a value is it will implicitly cast that value as an 'any' type. In its default state I almost find TypeScript to be more of a problem than a solution. If I can't consistently rely on the types it's probably better to not even pretend and just assume things are bad. I have helped a lot of people pick up TypeScript and most of them have run into this confusion at some point. The real problem is not with a simple (and obviously incorrect) situation like our example, but if a value is implicitly cast to 'any' five functions up the call stack or ten functions up, twenty. It can be hard to track down exactly where our types got screwed up. Everything in the module we are working on looks logical and correct.

This brings us to our first compiler flag (--noImplicitAny). I believe you shouldn't even try to use TypeScript without setting this flag, just use JavaScript and test the hell out of things. This flag prevents implicit casting to any. Using this, if TypeScript can't figure out a type you will get a compile-time error. Let's recompile our previous example using this flag.

```sh
$ npm run build -- --noImplicitAny true
Parameter 'obj' implicitly has an 'any' type.
```

Yes, this is what we want. We wrote obviously incorrect code. The compiler should tell us that. It should tell us exactly where we went wrong (line and column number), no hunting through stack traces for a runtime error.

This flag came and it is good. Let's add it to our tsconfig.

```json
{
    "compilerOptions": {
        "target": "es2015",
        "module": "commonjs",
        "moduleResolution": "node",
        "pretty": true,
        "removeComments": true,
        "rootDir": "./src",
        "outDir": "./build",
        "noImplicitAny": true
    },
    "exclude": [ "node_modules" ]
}
```

### Implicit Casting of This to Any

JavaScript allows many odd things. We are going to take a look at one of these odd things. This begs the question what is "this" in JavaScript. I delete everything in "index.ts" and start fresh with this:

```typescript
function getObjectName(): string {
    return this.name
}
```

This leads to a very similar problem to the implicit casting of variables/parameters to "any". Here we have a situation where "this" can be implicitly cast to "any".

```typescript
const person = {
    name: 'Louis',
    getName: getObjectName,
}

console.log(`Name: ${person.getName()}`)
```

I hope you aren't doing things like this. Just because JavaScript allows something doesn't mean a person should do that thing. However, this code works.

```sh
$ npm run build
$ node build/index.js
Name: Louis
```

Okay then, but it's not hard to think of a way to break this.

```typescript
const thing = {
    getName: getObjectname,
}

console.log(`Name: ${thing.getName()}`)
```

And just for completeness we run this.

```sh
$ npm run build
$ node build/index.js
Name: undefined
```

The compiler should not allow us to do this. It is obvious at compile-time that the object "thing" has no property "name" for us to read. Our last compiler flag was "--noImplicitAny". Our next compiler flag is "--noImplicitThis"

```sh
$ npm run build -- --noImplicitThis true
'this' implicitly has type 'any' because it does not have a type annotation.
```

How do we fix this? How do we provide a type annotation for "this".

```typescript
function getObjectName(this: { name: string }): string {
    return this.name
}
```

TypeScript treats "this" as an implicit argument to the function. You can then provide a type annotation in the function signature. With this fix the compiler will catch that the object "thing" should not be allowed to call this function.

```sh
$ npm run build -- --noImplicitThis true
Property 'name' is missing in type '{ getName: (this: { name: string; }) => string; }'
```

Awesome, already, with these two flags, TypeScript is a much stronger tool that gives us more guarantees. Let's add this flag to our config.

```json
{
    "compilerOptions": {
        "target": "es2015",
        "module": "commonjs",
        "moduleResolution": "node",
        "pretty": true,
        "removeComments": true,
        "rootDir": "./src",
        "outDir": "./build",
        "noImplicitAny": true,
        "noImplicitThis": true
    },
    "exclude": [ "node_modules" ]
}
```

### Strict Function Types

This is a little more nuanced than the first two problems we have looked at. By default TypeScript checks function types bivariantly. What does this mean? We'll take a look. This is going to take a little setup. We start by defining three classes.

```typescript
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
```

Looking at these three classes let's do a little mental exercise. Say we were to create functions to act on these classes. If I write a function that takes an Animal it should accept any of its subclasses.

```typescript
function getSpecies(animal: Animal): string {
    return animal.species
}

console.log(getSpecies(new Dog()))
```

However, if I write a function that takes a Dog it should only be able to take a Dog.

```typescript
function makeBark(dog: Dog): void {
    dog.bark()
}

makeBark(new Dog())
```

So far, so good, this all makes sense. However, say I define a type for a function.

```typescript
type AnimalAction = (animal: Animal)
```

What should we be able to assign to a variable of this type?

```typescript
const action: AnimalAction = makeBark
```

Should we allow this? No, because any function that accepts an Animal, as AnimalAction does, can accept any subtype of Animal. Allowing this allows us to then do something like this:

```typescript
action(new Cat())
```

This is going to be a runtime error. When defined a function type, that type should on accept arguments that are either exactly of the type defined in the type definition or in a more general (super) type.

However, by default, TypeScript allows the broken code we just wrote. By default will allow any super-type or sub-type to be used as a function argument type or a function return type. As we have seen this behavior is incorrect.

```sh
$ npm run build
$ node build/index.js
TypeError: dog.bark is not a function
```

Yeah, again, it safely compiles, but throws a runtime exception. As you have probably guessed we can fix this with a compiler flag. This time we are going to use "--strictFunctionTypes".

```sh
$ npm run build -- --strictFunctionTypes true
Type '(dog: Dog) => void' is not assignable to type 'AnimalAction'.
```

Yes, exactly what we want. It's now correctly checking the types of functions. We'll add this to config and our growing list of compiler flags.

```json
{
    "compilerOptions": {
        "target": "es2015",
        "module": "commonjs",
        "moduleResolution": "node",
        "pretty": true,
        "removeComments": true,
        "rootDir": "./src",
        "outDir": "./build",
        "noImplicitAny": true,
        "noImplicitThis": true,
        "strictFunctionTypes": true
    },
    "exclude": [ "node_modules" ]
}
```

### Strict Null Checks

We are approaching the muddled middle...

## Part 2: The Muddled Middle

### Definitely Typed

### Declaration Merging

### Inconsistencies With Interfaces

## Part 3: The Features That Will Help

### Discriminated Unions

#### Using Never

## Resources