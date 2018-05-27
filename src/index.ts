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

const obj: Shape = { radius: 32 }

if (isCicle(obj)) {
    console.log(`Radius: ${obj.radius}`)
}