interface IRectangle {
    type: 'Rectangle'
    width: number
    height: number
}

interface ICircle {
    type: 'Circle'
    radius: number
}

// interface ISquare {
//     type: 'Square'
//     side: number
// }

interface ITriangle {
    type: 'Triangle'
    side: number
}

type Shape = IRectangle | ICircle | ITriangle

function area(shape: Shape): number {
    switch (shape.type) {
        case 'Rectangle':
            return shape.width * shape.height
        case 'Circle':
            return Math.PI * Math.pow(shape.radius, 2)
        // case 'Square':
        //     return shape.side * shape.side
        // case 'Triangle':
        //     return (Math.sqrt(3)/4) * Math.pow(shape.side)
        default:
            const msg: never = shape
            throw new TypeError(`Unknown type: ${msg}`)
    }
}