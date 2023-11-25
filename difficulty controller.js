function difficulty_controller(){
    if(score > 20){
        player_speed = 5
        camera_speed = 4
    }
    if(score > 70){
        player_speed = 6
        camera_speed = 5
    }
    if(score > 120){
        player_speed = 7
        camera_speed = 6
        hole_chance = 30
    }
    if(score > 170){
        player_speed = 7.5
        camera_speed = 7
        hole_chance = 40
    }
    if(score > 200){
        player_speed = 8
        camera_speed = 7.5
        hole_chance = 55
    }
    if(score > 350){
        player_speed = 8.2
        camera_speed = 8
        hole_chance = 110
    }
    if(score > 400){
        player_speed = 9
        camera_speed = 8
        hole_chance = 40
    }
    if(score > 600){
        player_speed = 9.5
        camera_speed = 9
        hole_chance = 70
    }
    if(score > 1000){
        player_speed = 12.5
        camera_speed = 12
        hole_chance = 90
    }
    if(score > 1500){
        player_speed = 11.5
        camera_speed = 10
        hole_chance = 10
    }
    if(score > 1800){
        log("DEATH MODE")
        player_speed = 16
        camera_speed = 15
        hole_chance = 90
    }
}