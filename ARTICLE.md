# Surviving the TypeScript Ecosystem: Writing Type-Safe(ish) JavaScript Code

*A quick note before we get into it: All of the examples in this post use TypeScript v2.8.3. If you see different behavior check your version. I will try to update examples from time-to-time with TypeScript updates.*

## Introduction

What exactly is this post about? Is this a getting started with TypeScript post? Kind of. I’m calling this a getting started with assumptions, more of a survival guide. The assumptions I am going to make are that you are familiar with JavaScript and the associated ecosystem and that you are familiar with at least one statically-typed language (Java, Scala, Swift…). I won’t be explaining anything around the JavaScript ecosystem and I won’t be covering with any depth TypeScript features that are intuitive and/or consistent with other statically-typed languages. You will notice that a lot of TypeScript's notation will feel very similar to Java or C#. I will be covering areas where TypeScript doesn't behave as you would assume coming from those languages however.

I describe this more as a survival guide because we will be looking specifically at the features and inconsistencies in TypeScript that I have seen cause people the most trouble. Because of TypeScript’s integrations with JavaScript you typically cannot rely on getting the same safety you get from other statically-typed languages in addition there are complexities to integrating with JavaScript you have to consider.

After looking at some of the most common problems with TypeScript we will talk a look at some of the features that are unique to TypeScript or (I feel) underutilized in TypeScript. The features we will look at are ones that will give you more expressive power over your types, making it possible for you to more accurately express what your applications is doing through the type-system. The more accurately you can express statically what your application is doing the more helpful the compiler will become.

### What Is TypeScript?

Even though this isn't purely a getting started walk-through of TypeScript, I want to define TypeScript in something of a practical sense. I find the practical usage of TypeScript to be a little more nuanced than the official definition. Before I start pulling it apart, here is the official definition of TypeScript:

>TypeScript is a statically-typed superset of JavaScript - typescirptlang.org

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

$ npm install --save-dev typescript
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

This is a little more nuanced than the first two problems we have looked at. By default TypeScript checks function argument types bivariantly. What does this mean? We'll take a look. This is going to take a little setup. We start by defining three classes.

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

Looking at these three classes let's do a little mental exercise. Say we were to create functions to act on these classes. If I write a function that takes an Animal it should accept any of its subclasses because all of the subclasses will have the properties and methods of Animal.

```typescript
function getSpecies(animal: Animal): string {
    return animal.species
}

console.log(getSpecies(new Dog()))
```

However, if I write a function that takes a Dog it should only be able to take a Dog, or a subclass of Dog.

```typescript
function makeBark(dog: Dog): void {
    dog.bark()
}

makeBark(new Dog())
```

So far, so good, this all makes sense. However, say I define a type for a function.

```typescript
type AnimalAction = (animal: Animal) => void
```

What should we be able to assign to a variable of this type?

```typescript
const action: AnimalAction = makeBark
```

Should we allow this? No, because any function that accepts an Animal, as AnimalAction does, can accept any subtype of Animal. Allowing this allows us to then do something like this:

```typescript
action(new Cat())
```

This is going to be a runtime error. When defining a function type, that type should only accept arguments that are either exactly of the type defined in the type definition or in a more general (super) type. We refer to this as functions being contravariant in their argument type.

However, by default, TypeScript allows the broken code we just wrote. By default TypeScript will allow any super-type or sub-type to be used as a function argument type or a function return type. This is what we mean when we say that TypeScript allows function argument types to be bivariant. As we have seen this behavior is incorrect.

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

*Note: For more reading on this check out: What are Covariance and Contravariance?*

### Interfaces and Structural Typing

One way that TypeScript differs from most statically-typed object-oriented languages is that it used a predominately structural type system. What does this mean?

>A structural type system is a major class of type system, in which type compatibility and equivalence are determined by the type's actual structure or definition, and not by other characteristics such as its name or place of declaration. - Wikipedia

Let's look at an example. Say we have two interfaces that are equivalent...

```typescript
interface IPerson {
    name: string
}

interface IEmployee {
    name: string
}
```

As far as TypeScript is concerned these are actually the same type. TypeScript doesn't care that they have different names.

```typescript
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
```

This is just fine.

Something that you might not expect though is if we say that something is an IPerson, it has a name and age, but it also has an age and an email.

```typescript
const person: IPerson = {
    name: 'Carly Simon'
    age: 72,
    email: 'carly@fake.com'
}
```

This will actually be an error.

```sh
$ npm run build
Object literal may only specify known properties
```

So, TypeScript doesn't allow extra properties? This is where things get a little inconsistent.

```typescript
interface IPersonDesc {
    age: number
    email: string
}

const person: IPerson & IPersonDesc = {
    name: 'Carly Simon',
    age: 72,
    email: 'carly@fake.com',
}

const person2: IPerson = person
```

Okay, spoiler alert, this version will compile fine. Let's dissect. First of all we'll skip to the middle. The "&" operator, what does this do. This creates an intersection type. An intersection type takes all of the properties/methods from the interface on the left and adds them to the ones of the interface on the right and creates a new type that has all of the properties/methods of both.

Back to the top. We define a new interface that has the extra properties we wanted to use in addition to what was already available on the IPerson interface. We then defined a person object as having all of the properties, using the intersection operator, of both IPerson and IPersonDesc. This allows us to define the object we tried to define earlier.

The surprising bit comes on the last line. TypeScript will now allow us to assign an object with extra properties to an object of the IPerson interface. This is where an intersection type behaves a little differently than just creating a new interface. By using an intersection we have confirmed to TypeScript that the object we are creating does also conform to the IPerson interface. This does seem inconsistent. If we are looking purely at structure I wouldn't expect there to be a difference. However, this is how things work.

Related to this, let's look at one more example that isn't exactly what we might expect.

```typescript
interface IUser {
    name: string
}

const names: Array<string> = [ 'Bart', 'Homer', 'Marge', 'Lisa' ]

const users: Array<IUser> = names.map((name, index) => ({
   name,
   id: index
}))
```

Again, this will compile fine. We are creating an array of IUser, but the objects we are putting into the array all have an extra property. After seeing that this works try explicitly defining the return type of the map function.

```typescript
const users: Array<IUser> = names.map((name, index): IUser => ({
    name,
    id: index,
}))
```

This won't work.

```sh
$ npm run build
Object literal may only specify known properties
```

Okay, so what's going on here? Well, before we explicitly said the map function returned an IUser TypeScript had to infer the type. It infers this type to be an interface with a name property that is a string and an id property that is a number. Good job TypeScript. That is exactly right. When TypeScript infers this interface it takes things one step further and infers it to essentially be a subtype (or intersection) of the IUser type. This feels a little inconsistent, but it is what it is.

## Part 2: The Muddled Middle

We have gotten through the things that are most obviously wrong with TypeScript in its default behavior and how to fix those things to make TypeScript a much more useful tool. Now we are going to get into things that make TypeScript a little more difficult to pick up than maybe you would ideally like, but exist to make coexisting with the JavaScript ecosystem possible.

Let's start this exercise by clearing out "index.js" again and installing lodash in the usual way.

```sh
$ npm install --save lodash
```

Lodash is a JavaScript library. How do we use it?

```typescript
import * as lodash from 'lodash'

lodash.fake()
```

Hey, "lodash.fake()" isn't a function. Exactly, but TypeScript doesn't know that. Now that we know about "noImplicitAny", TypeScript should be catching this and saying "Hey, don't know what this is." If, however, we don't use "noImplicitAny" TypeScript will be just fine with casting lodash to any and allowing this to compile.

### Type Definitions

There is a better way to solve our lodash problem, but we're going to pretend for a second there isn't. Say you are using some JavaScript library for which TypeScript can't figure out the types, what do you do? The solution is to make a type definition file. A type definition file is a file that ends in ".d.ts". It is a lot like a header file in some other languages. It is a file in which you provide the type definitions for another file.

Create a new file in "src" called "modules.d.ts".

```typescript
declare module 'lodash' {
    function fake(): void
}
```

We can save this and try to compile.

```sh
$ npm run build
```

Everything is fine. We've told TypeScript there is a module called "lodash" and that it has a function called "fake". This is wrong of course, but TypeScript doesn't know the difference. If, however, we are being responsible and our type definitions are accurate we can provide types for JavaScript files that otherwise do not have types, making it possible for TypeScript to provide much stronger guarantees about our code.

*Note: There is nothing specials about the name "modules.d.ts", you could use any file name ending ".d.ts".*

### Type Scope

This is going to be a quick aside to discuss how TypeScript knew to find the types in "modules.d.ts" and what that implies for other situations.

TypeScript inherits the idea of global scope from JavaScript. What does that mean? In our tsconfig we told TypeScript that our source files exist in the "src" directory. When we run a build TypeScript will try to compile all of the "*.ts" files in this directory. Because JavaScript allows for global scope and because in a web browser you could load many JavaScript files that could all occupy that scope, TypeScript will assume all declarations to exist in that scope unless it understands that a file is a module. It will decide that a file is a module if it uses either the "import" or "export" keywords.

For example create a file called "test1.ts".

```typescript
interface IUser {
    name: string
}
```

And another file called "test2.ts"

```typescript
function getName(user: IUser): string {
    return user.name
}

console.log({ name: 'Karen' })
```

This all works fine. As far as TypeScript is concerned these files are going to execute in the same scope so "getName" can use a type defined in another file.

Then is our "module.d.ts" example TypeScript found the declaration for a module called "lodash" that is available for any file to import. This all works out correctly at runtime because the usual node module resolution takes over to find lodash in node_modules.

### Definitely Typed

We know lodash is very popular library. Many other people have already wanted types for this library. DefinitelyTyped in a community-sourced repository of type definition files. If you are trying to use a JavaScript library in your TypeScript code there is a very good chance someone else has already written a type definition file for it.

All type definitions that are contributed to DefinitelyTyped are uploaded to npm under the "@types" scope.

```sh
$ npm install --save @types/lodash
```

Now we can remove our incorrect module definition for lodash (delete the contents, but keep the file, in "modules.d.ts").

```typescript
import * as lodash from 'lodash'

lodash.filter([ 1, 2, 3, 4, 5, 6 ], (x) => x > 3)
```

Cool, that's not too bad. But how did TypeScript know how to find the newly downloaded type definition? When loading a JavaScript module from "node_modules" TypeScript will look in "node_modules/@types" to see if there is a corresponding type definition for this file. That's where the "@types" scope is special. TypeScript will load these types without us doing anything.

One thing to remember is that the type definition files in DefinitelyTyped are community sourced. In most cases they are not written by the library authors. There will be missing and/or incorrect definitions in some of these files. When you find that patch and send them a PR. We will look at how to fix these temporarily in a minute. However, please contribute back when you can.

### Publishing Definitions

You will notice I used the "--save" flag when I installed the lodash types. My personal habit is to install "@types" in the same way that I installed the module the types are for (either "--save" or "--save-dev"). In some cases what you choose to do here isn't important. However, if you are publishing your library, written in TypeScript, for others to consume it can be very important.

While DefinitelyTyped is an indispensable resource when working with libraries that were written in JavaScript it isn't the best solution if your project starts as a TypeScript project. If you are writing in TypeScript you can tell the compiler to automatically generate type definition files (.d.ts) for your compiled JavaScript files. You can then publish these files with your library.

You tell the compiler to do this by setting the "--declaration" compiler flag.

```sh
$ npm run build -- --declaration true
```

Now in your build directory you should see both "index.js" and "index.d.ts". You can publish this type declaration with your project so that users can consume your types when consuming your library.

In your package.json you can tell TypeScript where to look for your bundled types. Notice the new "types" property I added.

```json
{
  "name": "typescript-demo",
  "version": "1.0.0",
  "description": "",
  "main": "build/index.js",
  "types": "build/index.d.ts",
  "scripts": {
    "clean": "rm -rf build",
    "prebuild": "npm run clean",
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Kevin B. Greene<hightimesteddy@gmail.com>",
  "license": "Apache-2.0",
  "devDependencies": {
    "typescript": "^2.8.3"
  },
  "dependencies": {
    "@types/lodash": "^4.14.109",
    "lodash": "^4.17.10"
  }
}
```

When performing an import on your library TypeScript will see this and load the accompanying types.

Getting back to why it is important to choose how you save your types, either as a dependency or a dev dependency, if a type you import is used by one of your exports then the imported type will become visible to the consumers of your library. It should then be a dependency of your library so that the type is installed when your library is installed.

For example, in express when you call "app.listen(...)" an instance of "http.Server" is returned. "http.Server" is defined in the types for node. So if the types for node are not available when using the types for express then TypeScript will not know what an "http.Server" is.

Related to this is an issue I have run into when people consume my TypeScript and the types defined as dependencies of my library conflict, or are slightly different, than the versions of types that the user loaded for other libraries. This can lead to type conflicts. That is the type of something in my library uses a different version of an @types package than another library the consumer is using and the consumer expects the types to be compatible between libraries, but they aren't. Say I depended on "@types/node: '^8.9.3'" and another library loaded "@types/node: '^6.0.0'". There is a chance of type error between these two libraries. To make things as flexible for consumers as possible I sometimes choose to make @types dependencies "peerDependencies" so that consumers can choose a single version without my library install the @types dependencies when it loads my library.

### Declaration Merging

This brings us to an interesting feature of TypeScript, declaration merging. Yes, this pretty much does exactly what it sounds like. TypeScript allows you to modify a type after the type has been declared. This is somewhat analogous to being able to add methods or properties to an object prototype at any point in the lifecycle of a JavaScript application

```typescript
interface IPerson {
    name: string
}
```

Oops, I forgot to add a property to this interface. I could just go back to the interface definition and add it, but that would be too easy. No, I can just add too it later.

```typescript
interface IPerson {
    name: string
}

interface IPerson {
    age: number
}

const user: IPerson = {
    name: 'Charlie',
    age: 12,
}
```

If you think this looks weird, yes, it looks weird. In this case it is not useful at all and is more likely to cause headaches if you are extending your own types in this manner. TypeScript says there is a type error, that this property is missing, but I see the interface right here. It's fine.

Where this is useful is when consuming types. As mentioned, DefinitelyTyped is community-sourced. You will find problems. Yes, when you find problems you should send them a PR, but that doesn't help you right now.

For us, let's say that lodash actually does add a function called "fake", but the types haven't been updated. We could just cast lodash to any and use the function.

```typescript
import * as _ from 'lodash'

(_ as any).fake()
```

This is gross and anytime we use the function "fake" we would have to do this. Let's open back up our "modules.d.ts" file and import lodash into it.

```typescript
import * as _ from 'lodash'

declare module 'lodash' {
    interface LoDashStatic {
        fake(): boolean
    }
}
```

Wait, what is all of this? When extending modules you are going to use "declare module" to get inside of the module you want to extend. I looked at the actual @types/lodash definitions to find what it was I really needed to extend and found that all of the lodash functions are defined as methods on the "LoDashStatic" interface. So inside of the module "lodash" I extend, through declaration merging, the interface "LoDashStatic".

Now, back in our "index.ts" file we can use the newly defined fake function.

```typescript
import * as _ from 'lodash'

_.fake()
```

Now, my immediate problems are solved. I can continue working without any nasty casting to any. I can send DefinitelyTyped a PR and while I'm waiting on that to be merged and published I can use the definition in my "modules.d.ts". Then when it is published I can just delete the definition in "modules.d.ts" and update the @types version I pull in. No other code changes needed.

## Part 3: The Features That Will Help

Now we're going to start looking at a lot of features, some of which aren't common to other languages, that allow you to be much more expressive with how you describe the types in your application. To me these are the things that really make TypeScript fun and useful.

### Strict Null Checks

I almost put this section in Part 1 because it is the last of the "strict" compiler flags we will be looking at. However, this is decidedly more of a feature of TypeScript than a problem/inconsistency with TypeScript.

Purely speaking when you say something is a type you are declaring rules that define the set of values a type is allowed to have. Most languages that have the concept of a "null" or "nil" value allow that value to be in the set of almost any object type.

```typescript
interface IUser {
    name: string
}

const user: IUser = null
```

This is fine. The variable "user" is an IUser, it just happens to be missing. Wait, what?

```typescript
interface IUser {
    name: string
}

function getName(obj: IUser): string {
    return obj.name
}

const user: IUser = null

console.log(`Name: ${getName(user)}`)
```

Why are we usually allowed to write code like this? This code is just obviously broken at compile-time.

```sh
$ npm run build
$ node build/index.js
TypeError: Cannot read property 'name' of null
```

Yay, a runtime error and a stack trace. The favorite things in the lives of any programmer. TypeScript allows us to avoid this be giving us the ability to remove null (and undefined) from the set of values that can be assigned to a variable of a given type.

We do this with ."--strictNullChecks".

```sh
$ npm run build -- --strictNullChecks true
Type 'null' is not assignable to type 'IUser'.
```

Yes, this helps remove a whole class of the most annoying errors programmers deal with, null-pointer exceptions.

This flag forces us to write more correct code. If we want the ability to set a given object to null we must explicitly add null to the set of values it accepts.

```typescript
const user: IUser | null = null
```

This says "user" can be an IUser or null. This is a different type than just IUser. Now the compiler will force us to do a null check before calling "getUser".

```sh
$ npm run build -- --strictNullChecks
Argument of type 'null' is not assignable to parameter of type 'IUser'.
```

In our code we can wrap the call to "getUser" in a null check. Inside of the if-block TypeScript is smart enough to know our null check removed null as a possibility from the set of values user could be at that point.

```typescript
if (user !== null) {
    console.log(`Name: ${getName(user)}`)
} else {
    console.log('User is missing')
}
```

Now everything will compile and run without problem.

```sh
$ npm run build -- --strictNullChecks true
$ node build/index.js
User is missing
```

As I said this is the last of the "strict" compiler flags we are going to cover. We could then just add this to our tsconfig as we did with the others and be happy that our compiler was doing more for us. However, there is an easier way. Because all of these flags are related there is a way to turn them all on with one switch, "strict".

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
        "strict": true
    },
    "exclude": [
        "node_modules"
    ]
}
```

This is then how you should always use TypeScript, always use strict. Without it TypeScript is probably going to cause more confusion than benefit.

Using the strict compiler flag will turn on these options:

* noImplicitAny
* noImplicitThis
* alwaysStrict
* strictNullChecks
* strictFunctionTypes
* strictPropertyInitialization

We didn't look at "alwaysStrict" or "strictPropertyInitialization". Quickly then, "alwaysStrict" is a flag to always use JavaScript strict mode. The option for "strictPropertyInitialization" is similar to "strictNullChecks" it makes sure that the properties of a class are initialized before the constructor is finished executing.

### Function Overloads

JavaScript doesn't provide a mechanism for creating overloaded functions in the way some other languages do. However, because JavaScript is so dynamic, you can pass in any type to a function, or even a variable number of arguments. You will see then many people write pseudo-function-overloads by having a function behave differently based on the number of arguments or the types of the arguments passed in.

Even though we are limited by JavaScripts inability to declare overloaded function bodies, we can define overloaded function types in TypeScript. This allows us to document and type check all of the ways a function can be used.

For our example we are going to write a reduce function. For our reduce function we want the initial value of the accumulator to be optional. If the user does not pass in an initial value we will use the first element of the array we are acting on.

Let's start by defining our function types.

```typescript
type Reducer<U,T> = (acc: U, next: T) => U

function reduce<T>(reducer: Reducer<T,T>, initial: T, arr: Array<T>): T
function reduce<T>(reducer: Reducer<T,T>, arr: Array<T>): T
function reduce<U,T>(reducer: Reducer<U,T>, initial: U, arr: Array<T>): U
```

These are the three types that defined how we want our function to be consumed. The function can be called with a reducer, an initial value and an array where the return type in the same as the type of an element in the array. The function can be called without the initial value, in which case the first element in the array with be used as the initial value. Finally, the function can be called with an initial value that is of a different type than the elements in the array, in which case the function takes two type parameters.

We still have to write our function body. For the function body we need to make one more function declaration. However, this final declaration needs to be general enough to account for all of our overload declarations. This solution is obviously overly verbose for the problem, but it is meant to illustrate the idea of two function bodies based on the arguments.

```typescript
function reduce<T>(reducer: Reducer<T,T>, arr: Array<T>): T
function reduce<T>(reducer: Reducer<T,T>, initial: T, arr: Array<T>): T
function reduce<U,T>(reducer: Reducer<U,T>, initial: U, arr: Array<T>): U
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
        let index: number = 0let result: U = collection[index++]

        while (index < len) {
            result = reducer(result, collection[index])
            index++
        }

        return result
    }
}
```

When defining overload function definitions TypeScript will not allow a consumer to use the final, overly generic, definition "function reduce<U,T>(...args: Array<any>): U". It knows that consumers are to use the first two definitions and those define our public interface for this function.

The same thing can be done for function definitions.

### keyof Operator

The "keyof" operator is an indispensable tool for making TypeScript more expressive. The keyof operator is almost like an iterator for types. Let's look at a quick example. Say we have a simple interface where all of the fields are required.

```typescript
interface IProfile {
    user: IUser
    address: IAddress
}
```

Perhaps instead of this we want a IProfile objects where all of the fields could either be of the specified type or null.

```typescript
type Nullable<T> = {
    [P in keyof T]: T[P] | null
}

type NullableProfile = Nullable<IProfile>
```

The type Nullable creates a new interface where each of the keys in the original interface can either be of the type in the original interface or null.

There are two very useful types built into the standard TypeScript lib that take advantage of this, Readonly and Partial.

```typescript
type Readonly<T> = {
    readonly [K in keyof T]: T[K]
}
```

Readonly makes a new interface where each property is readonly. We could make a readonly array.

```typescript
type List<T> = Readonly<Array<T>>
```

Partial is also very useful. It takes an interface and makes all of the properties optional.

```typescript
type Partial<T> = {
    [K in keyof T]?: T[K]
}
```

This can be useful when you are merging user-defined options into a default set of configuration.

The keyof operator is a good one to experiment with to see what else can be done with it.

### Type Guards

Type guards are a great tool for working with union types or unreliable data. A type guard is simply a function that checks to see if its argument is of some type.

```typescript
interface IRectangle {
    width: number
    height: number
}

interface ICircle {
    radius: number
}

type Shape = IRectangle | ICircle

function isCicle(shape: Shape): shape is ICircle {
    return (shape as any).radius !== undefined
}
```

The interesting bit here is the function definition. Its return type is something odd "shape is ICircle". This function is literally testing if our argument "shape" is of type ICircle. The return type is very literal in what it is testing. In simpler terms the function is returning a boolean. However, what we are telling TypeScript is if this boolean is true we have a ICircle.

This becomes very useful when we use it in a conditional.

```typescript
const obj: Shape = { radius: 32 }

if (isCicle(obj)) {
    console.log(`Radius: ${obj.radius}`)
}
```

When the type guard returns true TypeScript will understand, and correctly type-check, the usage of "obj" as an ICircle inside of the if block. If instead of "obj.radius" we tried to read "obj.width" TypeScript would give a compile-time error.

An area where I find type guards to be particularly useful is when I am validating a payload from network request or other API that returns something of the "any" type. I will create a type guard that checks that the payload is what I expected from that API before I let it go out and start wrecking things in the rest of my code where I have put a lot of care into making sure everything is type-safe.

An even better solution to validating a payload from an API that returns "any" is to not actually use the raw data that came back from that API.

```typescript
interface IResponse {
    status: number
    user: {
        id: number
        name: string
    }
}

function validatedResponse(rawResponse: any): IResponse {
    if (
        typeof rawResponse.status === 'number' &&
        typeof rawResponse.user === 'object' &&
        typeof rawResponse.user.id === 'number' &&
        typeof rawResponse.user.name === 'string'
    ) {
        return {
            status: rawResponse.status,
            user: {
                id: rawResponse.user.id,
                name: rawResponse.user.name,
            }
        }
    } else {
        throw new Error('Unknown response type')
    }
}
```

Why do I deeply copy the object instead of just returning the rawResponse? If I am doing this because an API is potentially unreliable there could perhaps be extra properties I don't want which could cause a problem later if I am iterating through this object. It's better to have the strongest guarantees possible.

*Note: Of course, the better solution to my example if you are dealing with a lot of API request is to use some kind of schema validator and a deep copy library.*

### Discriminated Unions

Building on neatly from type guards is the notion of discriminated unions. With a type guard we define how we check to see if an object is of a particular type. If however we are able to provide hints for TypeScript we can get these checks automatically.

Let's revisit the shape interfaces we saw earlier. However, this time let's add a bit of extra information to the interfaces to differentiate the types.

```typescript
interface IRectangle {
    type: 'Rectangle'
    width: number
    height: number
}

interface ICircle {
    type: 'Circle'
    radius: number
}

type Shape = IRectangle | ICircle
```

In TypeScript literal values can be used as types. A type of ICircle must have a "type" property and the value of that property must be the literal string "Circle". This type property differentiates each of the types in the Shape union. Because the value of the type property is unique for each type in the Shape union TypeScript can differentiate types of the union based on a check of this property.

```typescript
function area(shape: Shape): number {
    switch (shape.type) {
        case 'Rectangle':
            return shape.width * shape.height
        case 'Circle':
            return Math.PI * Math.pow(shape.radius, 2)

    }
}
```

In each case of the above switch TypeScript knows which type from the Shape union we are dealing with based on the type property. In this way we are able to do a simple kind of type-matching.

### Using Never

This brings us to a very useful utility type in TypeScript, the "never" type. They never type is used for checking to see that certain parts of your code can't be evaluated at runtime. Why would we want to do that? Returning to our "area" function for Shape types let's add a default case.

```typescript
function area(shape: Shape): number {
    switch (shape.type) {
        case 'Rectangle':
            return shape.width * shape.height
        case 'Circle':
            return Math.PI * Math.pow(shape.radius, 2)
        default:
            const msg: never = shape
            throw new TypeError(`Unknown type: ${msg}`)
    }
}
```

Because we use the never type in the default case TypeScript will validate that it is impossible for the default case to be executed. This ensures that our cases are exhaustive for types in the Shape union.

To illustrate the value of this. Let's add a type to our Shape union.

```typescript
interface ITriangle {
    type: 'Triangle'
    side: number
}

type Shape = IRectangle | ICircle | ITriangle
```

Now if we try to compile our code.

```sh
$ npm run build
Type 'ITriangle' is not assignable to type 'never'.
```

The compiler tells us exactly what we are missing. We need to add a case to handle ITriangle to our area function.

```typescript
function area(shape: Shape): number {
    switch (shape.type) {
        case 'Rectangle':
            return shape.width * shape.height
        case 'Circle':
            return Math.PI * Math.pow(shape.radius, 2)
        case 'Triangle':
            return (Math.sqrt(3)/4) * Math.pow(shape.side, 2)
        default:
            const msg: never = shape
            throw new TypeError(`Unknown type: ${msg}`)
    }
}
```

Now everything compiles again.

### Branding and Type-Tagging
The last feature of TypeScript we are going to look at is something called branding or type-tagging. This is a way to make TypeScript's structural type system to differentiate types in a more nominal way. This isn't really so much a feature of TypeScript as it is using other features of TypeScript to get the desired behavior.

Why would we want to do this? A common example of this is currency. You could just use a number to represent currency, but if you are dealing with multiple currencies, say US dollars and Euros this can get confusing. You don't want to pass a number representing US dollars to a function expecting currency represented in Euros.

If you were to simply use a type alias this doesn't really solve the problem of being able to pass one currency to a function expecting the other, though it does make for somewhat better documentation within our code.

```typescript
type USD = number
type EUR = number
```

How can we do something similar but have the compiler catch when we pass the wrong currency to a function? What we can do is a bit of a cheat. We create a Brand type.

```
type Brand<K, T> = K & { __brand: T }
```

Okay, so let's read this. Brand is a generic type with two type parameters. The first type parameter "K" represents our base type and the second type parameter "T" represents out tag or brand. The resulting type is an intersection of the base type and an interface with a "__brand" property. The "__brand" property is typed to our tag type, making the resulting branded type unique from its base type.

Then we can redefined USD and EUR.

```typescript
type USD = Brand<number, 'USD'>
type EUR = Brand<number, 'EUR'>
```

The base type for both is number, so the resulting branded types can be used anywhere a number is expected, and the brand type for each is a literal string value.

Then we could take advantage of this branding by using our new types in a function.

```typescript
const usd = 10 as USD
const eur = 10 as EUR

function euroToUsd(euro: EUR): USD {
    return (euro * 1.18 as USD)
}

console.log(`USD: ${euroToUsd(eur)}`)
```

This is made a little easier because TypeScript will let us cast a number to one of our branded types.

A more complicated and probably more useful example is something that appeared in one of the nominal-type discussions on TypeScript's Github page. I couldn't find the link, but here is roughly the example. Both setTimeout and setInterval return numbers that are ids representing the specified timer. You can then call clearTimeout or clearInterval with this number to stop the timer. However, you shouldn't be allowed to pass an id returned from setTimeout to clearInterval or vise versa. The idea of branding can really become useful when developing APIs like this. Instead of just a plain number we could say setTimeout returned a TimeoutId and setInterval returned an IntervalId. Then their respective clear functions could be made to act only on the ids returned from from the correct set function.

```typescript
type TimeoutId = Brand<number, 'ClearTimeout'>
type IntervalId = Brand<number, 'ClearInterval'>

declare function setTimeout(handler: () => void, delay: number): TimeoutId
declare function setInterval(handler: () => void, delay: number): IntervalId
declare function clearInterval(scheduled: IntervalId): void
declare function clearTimeout(scheduled: TimeoutId): void

const scheduled: TimeoutId = setTimeout(() => {}, 1000)
clearInterval(scheduled)
```

We can override the global definitions of these functions our own definitions that used the branded types. However, one thing you may have discovered is that if you typed this in exactly your code still compiles. This is because of type-merging. TypeScript adds our declarations of these functions to the globally defined ones creating overloaded functions. The original definitions for these functions still exist. If you want to see this work as expected change your "index.ts" file to be a module.

```typescript
export const foo: string = 'bar'
```

By adding an export to our file TypeScript now sees our file as a module and will treat our function definitions a little differently. Before we forced TypeScript to see our file as a module we were writing everything in global scope. In this context TypeScript tries to be as loose as possible with how it works. It just merges our definitions with the global ones. However, when we are in a module our declarations don't leak to other modules and TypeScript is more restrictive. It treats the function declarations as how we want to use those functions in that module without side effects for other modules.

Now, when we compile, we should get an error.

```sh
$ npm run build
Argument of type 'ClearTimeout' is not assignable to parameter of 'ClearInterval'.
```

Cool. This can be a useful technique when developing your own public APIs. You don't really want consumers doing a lot of casting, but that can all be hidden from them and they can just get a nice compile-time error when they are using an API incorrectly.

## Conclusion
That concludes our whirlwind tour of many cool features and rough edges of TypeScript. Hopefully you found some nuggets of value here and there. TypeScript can be a pretty powerful tool. However, you need to know how to configure it and you need to know how to work through some of the rough patches and inconsistencies. TypeScript provides maximum integration with JavaScript and existing libraries. This makes TypeScript easy to pick up and easy to do incremental upgrades to an existing project. It makes it hard to get the kind of type security you would normally expect from a language touting itself as statically-typed.