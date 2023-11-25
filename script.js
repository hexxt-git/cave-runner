let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Events = Matter.Events,
    log = console.log;
    container = document.getElementById("container"),
    width = container.clientWidth,
    height = container.clientHeight

random = (min, max) => Math.random()*(max-min)+min

let engine = Engine.create(),
    runner = Runner.create(),
    renderer = Render.create({
        element: container,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            wireframeBackground: false
        }
    })
let inputs = {x: 0, y: 0}

let platform_width = 150
let num_platforms = Math.ceil(width/platform_width) + 1
let player_speed = 6
let player_jump = 0.25
let camera_speed = 3
let gravity = 0.002

let player = {
    object: Bodies.rectangle(200, 200, 50, 100)
}
player.object.render.fillStyle = "yellow"
let platforms = []
for(let i = 0; i < num_platforms; i++){
    z = random(50, 200)
    platforms.push(Bodies.rectangle(i*platform_width+50, height-z/2, platform_width, z, {isStatic: true}))
}
let camera_x = 0


for(let i in platforms){
    platforms[i].render.fillStyle = "rgb(50, 255, 125)"
}

Composite.add(engine.world, [player.object, ...platforms])
engine.world.gravity.scale = gravity

Render.run(renderer)
Runner.run(runner, engine)

Events.on(runner, "tick", ()=>{
    camera_x += camera_speed
    renderer.bounds = { min: { x: camera_x, y: 0 }, max: { x: width+camera_x, y: height }}
    Render.startViewTransform(renderer)
    
    Body.setAngle(player.object, 0); 
    Body.setAngularVelocity(player.object, 0);

    Body.setVelocity(player.object, {
        x: inputs.x*player_speed,
        y: player.object.velocity.y
    })
    Body.applyForce(player.object, player.object.position, {x:0, y:inputs.y*player_jump})
    inputs.y = 0
    
})


document.addEventListener("keydown", (event)=>{
    if(event.repeat) return;
    if(event.key == "w") inputs.y = -1
    if(event.key == "a") inputs.x = -1
    if(event.key == "d") inputs.x = 1
})
document.addEventListener("keyup", (event)=>{
    if(event.repeat) return;
    if(event.key == "w") inputs.y = 0
    if(event.key == "a") inputs.x = 0
    if(event.key == "d") inputs.x = 0
})


/*
// what i learned
let my_engine = Engine.create()
let my_renderer = Render.create({
    element: container,
    engine: my_engine,
    options: {
        width: container.clientWidth,
        height: container.clientHeight,
        wireframes: false
    }
})
let my_runner = Runner.create()
let ball = Bodies.circle(50, 50, 20, {restitution: 0.3})
let floor = Bodies.rectangle(150, 400, 300, 20, {isStatic: true})

floor.render.fillStyle = "red"

Composite.add(my_engine.world, [ball, floor])

Render.run(my_renderer)
Runner.run(my_runner, my_engine)

my_renderer.bounds = { min: { x: -300, y: 0 }, max: { x: container.clientWidth-300, y: container.clientHeight }}
Render.startViewTransform(my_renderer)

Events.on(my_runner, "tick", ()=>{
    Body.applyForce(ball, ball.position, {x:0.0005, y:0})
    Body.rotate(floor, -0.01)
})

*/