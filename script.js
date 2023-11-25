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
            background: 'transparent',
        }
    })
let inputs = {x: 0, y: 0}

let platform_width = 250
let platform_height = container.clientHeight
let num_platforms = Math.ceil(width/platform_width)+1
let player_speed = 4
let player_jump = 14
let camera_speed = 3
let gravity = 0.0027
let hole_chance = 20
let can_jump = false
let jumps_left = 2
let score = 0
let state = 'run'

let player = Bodies.rectangle(width/2, 100, 64, 64)
player.render.sprite.texture = "./assets/elementals_wind_hashashin_FREE_v1.1/PNG/idle/idle_1.png"
player.render.sprite.yOffset = 0.855
player.render.sprite.yScale = 1.75
player.render.sprite.xScale = 1.75
player.label = "player"
let platforms = []
for(let i = 0; i < num_platforms; i++){
    z = height-random(50, 300)
    platforms.push(Bodies.rectangle(i*platform_width+50, z+platform_height/2, platform_width+1, platform_height, {isStatic: true}))
    platforms[i].render.fillStyle = ['#3C2E2E', '#3D2F2F', '#3E3030', '#403232'][Math.floor(random(0,4))]
    platforms[i].render.strokeStyle = 'transparent'
    platforms[i].label = "platform"
}
let coins = []

let camera_x = 0

Composite.add(engine.world, [player, ...platforms, ...coins])
engine.world.gravity.scale = gravity

let music = new Audio('./assets/audio/music.mp3');
music.play();

Render.run(renderer)
Runner.run(runner, engine)

Events.on(runner, "tick", ()=>{
    difficulty_controller()

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
        audio.volume = 0.5;
        audio.play();
        jumps_left -= 1
    }
    can_jump = false
    inputs.y = 0
    
    for(let i in platforms){
        if(platforms[i].position.x < camera_x-platform_width/2){
            z = height-random(50, 250)
            if(platforms[i==0?num_platforms-1:i-1].position.y != height*3/2 + 100 && random(0,100) < hole_chance) z = height + 100
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
        music.volume = 0.1
        setTimeout(()=>{
            alert("you lost!")
            location.reload()
        }, 200)
    }

    if(player.position.x > score*100){
        score = Math.floor(player.position.x/100)
        document.getElementById("score").innerHTML = `score: ${score}`
    }

    if(inputs.x == 1){
        state = 'runRight'
    } else if(inputs.x == 0){
        state = 'idle'
    } else if(inputs.x == -1){
        state = 'runLeft'
    }

    for(let i in coins){
        if(coins[i].position.x < camera_x || coins[i].position.y > height-30){
            Composite.remove(engine.world, coins[i])
            coins.splice(i, 1)
        }
    }

    if(random(0,100) < camera_speed/10){
        let coin = Bodies.circle(camera_x+width, random(0, height*2/3), 8, {restitution: 0.9, label: "coin"})
        coin.render.fillStyle = "yellow"
        coin.render.strokeStyle = "transparent"
        coins.push(coin)
        Composite.add(engine.world, coin)
        Body.setVelocity(coin, {
            x: -random(3,10),
            y: 0
        })
    }
})

Events.on(engine, "collisionActive", (event)=>{
    for(let pair of event.pairs){
        if( (pair.bodyA.label == "platform" && pair.bodyB === player && pair.bodyA.position.y > pair.bodyB.position.y) ||
            (pair.bodyB.label == "platform" && pair.bodyA === player && pair.bodyB.position.y > pair.bodyA.position.y) ){
            can_jump = true
        }
    }
})
Events.on(engine, "collisionStart", (event)=>{
    for(let pair of event.pairs){
        if(pair.bodyB.label == "coin" && pair.bodyA === player){
            score += 25
            document.getElementById("score").innerHTML = `score: ${score}`
            Composite.remove(engine.world, pair.bodyB)
            let audio = new Audio('./assets/audio/coin.wav');
            audio.play();
        }
        if(pair.bodyA.label == "coin" && pair.bodyB === player){
            score += 25
            document.getElementById("score").innerHTML = `score: ${score}`
            Composite.remove(engine.world, pair.bodyA)
            let audio = new Audio('./assets/audio/coin.wav');
            audio.play();

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