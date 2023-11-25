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
            background: 'transparent'
        }
    })
let inputs = {x: 0, y: 0}

let platform_width = 200
let platform_height = container.clientHeight
let num_platforms = Math.ceil(width/platform_width)+1
let player_speed = 5
let player_jump = 14
let camera_speed = 4
let gravity = 0.0027
let chance_for_hole = 20
let can_jump = false
let on_platform = false
let jumps_left = 2
let score = 0
let state = 'run'

let player = Bodies.rectangle(width/2, 200, 64, 64)
player.render.sprite.texture = "./assets/elementals_wind_hashashin_FREE_v1.1/PNG/idle/idle_1.png"
player.render.sprite.yOffset = 0.875
player.render.sprite.yScale = 1.75
player.render.sprite.xScale = 1.75
let platforms = []
for(let i = 0; i < num_platforms; i++){
    z = height-random(50, 200)
    platforms.push(Bodies.rectangle(i*platform_width+50, z+platform_height/2, platform_width, platform_height, {isStatic: true}))
    
    platforms[i].label = "platform"
}
let camera_x = 0

Composite.add(engine.world, [player, ...platforms])
engine.world.gravity.scale = gravity

Render.run(renderer)
Runner.run(runner, engine)

Events.on(runner, "tick", ()=>{
    camera_x += camera_speed
    renderer.bounds = { min: { x: camera_x, y: 0 }, max: { x: width+camera_x, y: height }}
    Render.startViewTransform(renderer)
    
    Body.setAngle(player, 0); 
    Body.setAngularVelocity(player, 0);

    Body.setVelocity(player, {
        x: inputs.x*player_speed,
        y: player.velocity.y
    })

    if(can_jump) jumps_left = 2
    if(jumps_left > 0 && inputs.y != 0){
        Body.setVelocity(player, {
            x: player.velocity.x,
            y: player_jump*inputs.y
        })
        let audio = new Audio('./assets/audio/jump.wav');
        audio.play();
        jumps_left -= 1
    }
    can_jump = false
    inputs.y = 0
    
    for(let i in platforms){
        if(platforms[i].position.x < camera_x-platform_width/2){
            z = height-random(50, 250)
            if(platforms[i==0?num_platforms-1:i-1].position.y != height*3/2 + 100 && random(0,100) < chance_for_hole) z = height + 100
            Body.setPosition(platforms[i], {
                x: camera_x + platform_width*(num_platforms-1/2),
                y: z + platform_height/2
            })
        }
        if(i!=0) if(Math.abs(platforms[i].position.y - platforms[i-1].position.y) < 15){
            Body.setPosition(platforms[i], {
                x: platforms[i].position.x,
                y: platforms[i==0?num_platforms-1:i-1].position.y
            })
        }
    }

    if(player.position.x < camera_x || player.position.y > height){
        let audio = new Audio('./assets/audio/death.wav');
        audio.play();
        Runner.stop(runner)
        setTimeout(()=>{
            //alert("you lost!")
            location.reload()
        }, 200)
    }

    if(player.position.x > score*100){
        score = Math.floor(player.position.x/100)
        document.getElementById("score").innerHTML = `Score: ${score}`
    }

    if(inputs.x == 1){
        state = 'runRight'
    } else if(inputs.x == 0){
        state = 'idle'
    } else if(inputs.x == -1){
        state = 'runLeft'
    }

})

Events.on(engine, "collisionActive", (event)=>{
    for(let pair of event.pairs){
        if( (pair.bodyA.label == "platform" && pair.bodyB === player && pair.bodyA.position.y > pair.bodyB.position.y) ||
            (pair.bodyB.label == "platform" && pair.bodyA === player && pair.bodyB.position.y > pair.bodyA.position.y) ){
            can_jump = true
            on_platform = true
        }      
    }
})

f = 0
setInterval(()=>{
    f += 1
    if(state == 'idle'){
        player.render.sprite.texture = `./assets/elementals_wind_hashashin_FREE_v1.1/PNG/idle/idle_${f%8+1}.png`
    }
    if(state == 'runRight'){
        player.render.sprite.texture = `./assets/elementals_wind_hashashin_FREE_v1.1/PNG/run/run_${f%8+1}.png`
    }
    if(state == 'runLeft'){
        player.render.sprite.texture = `./assets/elementals_wind_hashashin_FREE_v1.1/PNG/run left/run_${f%8+1}.png`
    }
}, 150)

document.addEventListener("keydown", (event)=>{
    if(event.repeat) return;
    if(event.key == "w" || event.key == "ArrowUp" || event.key == " ") inputs.y = -1
    if(event.key == "a" || event.key == "ArrowLeft") inputs.x = -1
    if(event.key == "d" || event.key == "ArrowRight") inputs.x = 1
})
document.addEventListener("keyup", (event)=>{
    if(event.repeat) return;
    if(event.key == "a" || event.key == "ArrowLeft") inputs.x = 0
    if(event.key == "d" || event.key == "ArrowRight") inputs.x = 0
})
document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("resize", () => {
        location.reload();
    });
});


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