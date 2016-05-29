/**
 * Created by Hallur on 09-05-2016.
 */
"use strict";
var stage, ground, ground2, hero, livesText, scoreText, roundText, startGame, tryAgain;
var lives = 3;
var score = 0;

var queue;
var preloadText;
var gameRunning;
var tweenDone = false;

var keys = {
    rkd:false,
    lkd:false,
    ukd:false,
    dkd:false
};

var round = 0;
var numClouds;
var cloud;
var clouds = [];
var obstacles = [];
var obstacleSpeed = 4;
var amount = 10;

function preload() {
    stage = new createjs.Stage("jumpman");
    preloadText = new createjs.Text("0%", "30px monospace", "#FFF");
    stage.addChild(preloadText);
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', loading);
    queue.on('complete', startGame);

    queue.loadManifest([
        {id:"cloud", src:"img/cloud.png"},
        {id:"ground", src:"img/ground.png"},
        {id:"hero", src:"img/hero.png"},
        {id:"rock", src:"img/rock.png"},
        {id:"rocket", src:"img/rocket2.png"},
        {id:"life", src:"img/life.png"},
        {id:"start", src:"img/play2.png"},
        {id:"heroSS", src:"js/sprite.json"},
        "img/heroSprite.png",
        {id:"jump", src:"sound/jump.mp3"},
        {id:"extraLife", src:"sound/life.mp3"},
        {id:"hitObstacle", src:"sound/hit.mp3"},
        {id:"gameSound", src:"sound/troll.mp3"},
        {id:"restart", src:"img/tryAgain.png"}
    ])
}
function loading (e){
    console.log(e.progress);
    preloadText.text = Math.round(e.progress*100) + "%";
    stage.update();
}
function startGame(){
    if (!gameRunning) {
        //createjs.Sound.play("gameSound");
        stage.removeChild(preloadText);
        startGame = new createjs.Bitmap(queue.getResult("start"));
        startGame.width = 138;
        startGame.height = 63;
        console.log(startGame);

        stage.update();
        startGame.addEventListener('click', goStart);
    }
    scoreText = new createjs.Text("Score: " + score, "35px monospace", "#FFF");
    scoreText.alpha=1;

    livesText = new createjs.Text("Lives left: " + lives, "25px monospace", "#FFF");
    livesText.y = 35;
    livesText.alpha=1;

    roundText = new createjs.Text("Round: " + round, "15px monospace", "#FFF");
    roundText.y = 62;
    roundText.alpha = 1;

    ground = new createjs.Bitmap(queue.getResult("ground"));
    ground.x = 0;
    ground.y = 439;
    ground.width = 600;
    ground.height = 61;

    var heroSpriteSheet = new createjs.SpriteSheet(queue.getResult("heroSS"));
    hero = new createjs.Sprite(heroSpriteSheet, 'jump');
    hero.width = 40;
    hero.height = 66;
    hero.x = 100;
    hero.y = -100;
    hero.speed = 3;
    hero.jump = true;
    hero.stayDown = true;

    window.addEventListener('keydown', fingerDown);
    window.addEventListener('keyup', fingerUp);

    stage.addChild(ground, hero);
    stage.addChild(livesText, scoreText, roundText);
    stage.addChild(startGame);
    stage.update();
}
function goStart() {
    gameRunning=false;
    setupClouds();
    stage.removeChild(startGame);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', onTick);
    createjs.Tween.get(hero)
        .to({y:443 - hero.height }, 1000, createjs.Ease.linear).call(function(){
        tweenDone = true;
        hero.gotoAndPlay('run');
        hero.jump=false;
    });
}
function setupClouds() {
    numClouds = 9;
    var i=0;
    for (; i<numClouds; i++) {
        cloud = new createjs.Bitmap(queue.getResult("cloud"));
        cloud.width = 259;
        cloud.x = stage.canvas.width+Math.floor(Math.random()*500)*i;
        cloud.y = Math.floor(Math.random()*100)+100;
        stage.addChild(cloud);
        clouds.push(cloud);
    }
}
function fingerUp(e){
    if(e.keyCode===37){
        keys.lkd=false;
    }
    if(e.keyCode===38){
        keys.ukd=false;
    }
    if(e.keyCode===39){
        keys.rkd=false;
    }
    if(e.keyCode===40){
        keys.dkd=false;
    }
}
function fingerDown(e){
    if(e.keyCode===37){
        keys.lkd=true;
    }
    if(e.keyCode===38){
        keys.ukd=true;
    }
    if(e.keyCode===39){
        keys.rkd=true;
    }
    if(e.keyCode===40){
        keys.dkd=true;
    }
}
function moveHero(){
    if(keys.rkd){
        hero.x+=hero.speed;
    }
    if(keys.lkd){
        hero.x-=hero.speed;
    }
    if(keys.ukd){
        heroJump();
    }
    if(keys.dkd && !hero.jump){
        hero.y = 403;
        hero.jump = true;
    }
    if((!keys.dkd && !keys.ukd) && (hero.jump && hero.stayDown) ){
        hero.y = 439 - hero.height;
        hero.jump = false;
    }
    if (hero.x < 0){
        hero.x+=hero.speed;
    }
    if (hero.x+hero.width > stage.canvas.width) {
        hero.x-=hero.speed;
    }
}
function heroJump () {
    if(!hero.jump) {
        hero.gotoAndStop('jump');
        createjs.Sound.play("jump");
        hero.jump = true;
        hero.stayDown = false;
        createjs.Tween.get(hero)
            .to({y:hero.y - 80}, 300, createjs.Ease.circOut)
            .to({y:hero.y}, 300, createjs.Ease.circIn).call(function(){
            hero.gotoAndPlay('run');
            hero.jump=false;
            hero.duck=false;
            hero.stayDown = true;
        });
    }
}
function addObstacles() {
    var i = obstacles.length;
    for (; i < amount; i++) {
            var rock = new createjs.Bitmap(queue.getResult("rock"));
            rock.width = rock.height = 30;
            rock.x = stage.canvas.width + (i * 200);
            rock.y = 409;
            rock.dangerous = true;
            rock.name = "rock";

            var rocket = new createjs.Bitmap(queue.getResult("rocket"));
            rocket.width = 43;
            rocket.height = 32;
            rocket.dangerous = true;
            rocket.x = rock.x;
            rocket.y = 409 - hero.height;
            rocket.dy = 0.5;
            rocket.name = "rocket";
            rocket.chanceOfRocket = 3;

            var extraLife = new createjs.Bitmap(queue.getResult("life"));
            extraLife.width = 33;
            extraLife.height = 29;
            extraLife.x = rock.x;
            extraLife.y = 380;
            extraLife.chanceOfSpawn = 15;
            extraLife.text = "LIFE";
            extraLife.lifeGain = false;


            var randomness1 = 165;
            var randomness2 = 35;


            // ROUND 5
            if (round > 3){
                randomness1 = 150;
                randomness2 = 55;
                rocket.chanceOfRocket = 2;
            }
            // ROUND 4
            if (round > 2){
                rock.x = stage.canvas.width + (i * randomness1 + Math.floor(Math.random()*randomness2));
                rocket.x = stage.canvas.width + (i * randomness1 + Math.floor(Math.random()*randomness2));
            }
            // ROUND 3
            if (round > 1){
                rocket.chanceOfRocket = 3;
            }

            // ROUND 2
            if (Math.floor(Math.random() * rocket.chanceOfRocket) === 1 && round > 0) {
                stage.addChild(rocket);
                obstacles.push(rocket);
                if (Math.floor(Math.random()*2) == 1)
                {
                    obstacles[i].y = 377 + Math.floor(Math.random() * 12);
                } else {
                    console.log("here i am");
                    obstacles[i].y = 350;
                }
                // GAIN EXTRA LIFE CHANCE
            } else if (Math.floor(Math.random() * extraLife.chanceOfSpawn) === 1 && round%2==0) {
                console.log("Extra life!")
                stage.addChild(extraLife);
                obstacles.push(extraLife);
            } else {
                stage.addChild(rock);
                obstacles.push(rock);
            }
    }
    amount+=5;
    score=Math.round(score*1.5);
    round++;
    if (obstacleSpeed<5.5) {
        obstacleSpeed += round/4;
    }
}
function move() {
    var numObstacles = obstacles.length;
    var r = numObstacles-1;
    for (; r>=0; r--){
        obstacles[r].x -= obstacleSpeed;
        if (obstacles[r].name=="rocket" && round>3){
            obstacles[r].y+=obstacles[r].dy;
            if (obstacles[r].y>390 || obstacles[r].y<365) {
                obstacles[r].dy*=-1;
            }
        }
        if(obstacles[r].x < -obstacles[r].width){
            obstacles[r].x=numObstacles*200;
            obstacles[r].dangerous = true;
            stage.removeChild(obstacles[r]);
            obstacles.splice(r, 1);
        }
    }
    var c = 0;
    for (; c < numClouds; c++){
        clouds[c].x-=0.8;
        if(clouds[c].x < -clouds[c].width){
            clouds[c].x=stage.canvas.width+clouds[c].width;
        }
    }
}
function hitTest(rect1,rect2) {
    if ( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y )
    {
        return false;
    }
    return true;
}
function checkCollisions() {
        var numObstacles = obstacles.length;
        var i = numObstacles-1;
        for (; i>=0; i--){
            if(obstacles[i].dangerous && hitTest(hero, obstacles[i])) {
                console.log("You lost a life");
                createjs.Sound.play("hitObstacle");
                lives--;
                heroLoseLife();
                obstacles[i].dangerous = false;
            }
            if(obstacles[i].lifeGain == false && (obstacles[i].text === "LIFE" && hitTest(hero, obstacles[i]))){
                console.log("You gained a life");
                createjs.Sound.play("extraLife");
                stage.removeChild(obstacles[i]);
                obstacles.splice(i, 1);
                lives++;
                obstacles[i].lifeGain = true;
            }
        }
    }
function heroLoseLife() {
    createjs.Tween.get(hero)
        .to({alpha:0.1}, 0, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 0, createjs.Ease.linear).wait(200)
        .to({alpha:0.1}, 0, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 0, createjs.Ease.linear).wait(200)
        .to({alpha:0.1}, 0, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 0, createjs.Ease.linear).wait(200)
    };
function gameOver (){
    if(gameRunning===false){
        hero.gotoAndStop('jump');
        updateText();
        createjs.Tween.get(livesText)
            .to({alpha:0}, 1500, createjs.Ease.circOut);
        createjs.Tween.get(roundText)
            .to({alpha:0}, 1500, createjs.Ease.circOut);
        scoreText.font = ("50px monospace");
        scoreText.textAlign = ("center");
        createjs.Tween.get(scoreText)
            .to({y:130, x:stage.canvas.width/2 }, 2500, createjs.Ease.circOut);

        createjs.Tween.get(hero)
            .to({y:stage.canvas.height/2, x:stage.canvas.width/2, rotation:10030, regX:hero.width/2, regY:hero.height/2}, 3000, createjs.Ease.circOut);

        var numClouds = clouds.length;
        var i = numClouds - 1;
        for (; i >= 0; i--) {
            createjs.Tween.get(clouds[i])
                .to({alpha: 0}, 2000, createjs.Ease.circOut).call(function(){
                stage.removeChild(clouds[i]);
                clouds.splice(i, 1);});
        }

        tryAgain = new createjs.Bitmap(queue.getResult("restart"));
        tryAgain.width = 317;
        tryAgain.height = 96;
        tryAgain.regX = tryAgain.width / 2;
        tryAgain.regY = tryAgain.height / 2;
        tryAgain.x = stage.canvas.width / 2;
        tryAgain.y = 360;
        tryAgain.alpha = 0;
        stage.addChild(tryAgain);

        createjs.Tween.get(tryAgain)
            .wait(2000).to({alpha:1}, 1000, createjs.Ease.circOut).call(function(){
            console.log("hot")
            tryAgain.addEventListener('click', restartGame);
        });
        gameRunning=true;
    }
}
function restartGame(){
    console.log("restart hit")
    tryAgain.removeEventListener('click', restartGame);
    tryAgain.alpha=0;
    round=0;
    lives=3;
    score=0;
    amount=10;
    obstacleSpeed = 4;
    stage.removeAllChildren();
    stage.addChild(ground, hero);
    stage.addChild(livesText, scoreText, roundText);
    hero.rotation=0;
    hero.x = 100;
    hero.y = -100;
    hero.regX = 0;
    hero.regY = 0;
    tweenDone = false;
    scoreText.alpha=1;
    scoreText.regX=0;
    scoreText.regY=0;
    scoreText.y=0;
    scoreText.x=0;
    scoreText.font=('35px monospace');
    scoreText.textAlign = ("left");
    scoreText.textAlign = ("left");

    livesText.y = 35;
    livesText.alpha=1;

    roundText.y = 62;
    roundText.alpha = 1;

    goStart();
}
function updateText(){
    livesText.text = "Lives left: " + lives;
    scoreText.text = "Score: " + score;
    roundText.text = "Round: " + round;
}
function onTick(e) {
    if ((obstacles.length === 0 && lives > 0) && tweenDone) {
       addObstacles();
    }
    if (lives > 0){
        updateText();
        moveHero();
        move();
        checkCollisions();
        score++;
    } else {
        var numObstacles = obstacles.length;
        var r = numObstacles - 1;
        for (; r >= 0; r--) {
            stage.removeChild(obstacles[r]);
            obstacles.splice(r, 1);
        }
        gameOver();
    }
    stage.update(e);
}