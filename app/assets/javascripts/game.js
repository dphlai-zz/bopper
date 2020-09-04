const WIDTH = 800;
const HEIGHT = 600;
const Y_GRAVITY = 300;
const ENEMY_VELOCITY = 50;

const HIGHSCORE_ROUTE = '/'
const SCORE_ROUTE = '/scores'
const MAPDATA_ROUTE = '/mapdata'
const POST_PLATFORM_ROUTE = '/platforms'

let config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  scale: {
    parent: 'CanvasDiv',
    mode: Phaser.Scale.FIT,

    autoCenter: Phaser.Scale.CENTER_HORIZONTAL,
    isPortrait: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: Y_GRAVITY },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);
let rows;

function preload() {
  this.load.image('sky', 'assets/background.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('bomb', 'assets/space-baddie-purple.png');
  this.load.spritesheet('star',
    'assets/coin.png',
    {frameWidth: 32, frameHeight: 32}
  );
  this.load.spritesheet('dude',
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );

  this.load.spritesheet('mummy',
    'assets/mummy.png',
    { frameWidth: 37, frameHeight: 45 }
  );

}

let jumpCount = 0;
let platforms;
let player;
let mummy;
let scene;
let score = 0;
let scoreText;
let bombs;
let coins;

function create() {
  this.add.image(400, 300, 'sky');
  initPlatforms(this)
  player = initPlayer(this);
  initPlayerAnims(this);
  mummy = initMummyFollow(this);
  initCoins(this);
  cursors = this.input.keyboard.createCursorKeys();
  initCoinSpin(this)
  initMummyWalk(this)
  scene = this
  scoreText = this.add.text(16, 16, 'Score : 0', {
    fontSize: '32px', fill: '#fff'
  });
  bombs = this.physics.add.group();
  dropBomb();
  initAllCollisions(this, player, platforms, mummy, bombs, coins, collectStar, hitBomb);
  setPlatforms();
}
function setPlatforms(){
  $.getJSON(MAPDATA_ROUTE)
    .done(res => {
      let resPlatforms = res.platforms;
      if (resPlatforms !== undefined && resPlatforms.length > 0) {
        resPlatforms.forEach(function (platformData) {
          singularPlatform = platforms.create(platformData.x, platformData.y, 'ground');
          singularPlatform.displayWidth = platformData.width;
          singularPlatform.displayHeight = platformData.height;
          singularPlatform.refreshBody();
        })
      } else {
        renderPlatforms();
      }
    })
    .fail(err => console.warn(err))
}
function initMummyWalk(scene){
  scene.anims.create({
    key: 'walk',
    frames: scene.anims.generateFrameNumbers('mummy', { start: 0, end: 17 }),
    framerate: 10,
    repeat: -1
  });
}
function initCoinSpin(scene){
  scene.anims.create({
    key: 'spin',
    frames: scene.anims.generateFrameNumbers('star', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });
}
function initAllCollisions(scene, player, platforms, mummy, bombs, coins, coinCollideFunc, bombCollideFunc){
  scene.physics.add.collider(coins, platforms);
  scene.physics.add.overlap(player, coins, coinCollideFunc, null, scene);
  scene.physics.add.collider(bombs, platforms);
  scene.physics.add.collider(player, bombs, bombCollideFunc, null, scene);
  scene.physics.add.collider(player, platforms);
  scene.physics.add.collider(mummy, player);
}
function initCoins(scene){
  coins = scene.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  coins.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
}
function initPlatforms(scene){
  platforms = scene.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
}
function initPlayer(scene){
  player = scene.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(200);

  return player
}
function initMummyFollow(scene){
    // Just leave this here research it later
  // might be the ticket to having a real enemy
  let graphics = scene.add.graphics();
  // = == ==== = == == = ==== = == === = == =
  path = scene.add.path(700, 513);
  path.lineTo(100, 513);
  path.lineTo(700, 513);
  mummy = scene.add.follower(path, 700, 513, 'mummy').startFollow({
    duration: 8000,
    loop: -1
  });
  return mummy;
}
function initPlayerAnims(scene){
  scene.anims.create({
    key: 'left',
    frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20
  });
  scene.anims.create({
    key: 'right',
    frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
}
function dropStars(scene){
  coins.clear(true);
  bombs.clear(true);
  coins = scene.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  coins.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  scene.physics.add.collider(coins, platforms);
  scene.physics.add.overlap(player, coins, collectStar, null, this);

  dropBomb();
}
function resetPlayer(scene){
  //player.clear(true);
  const {x, y} = generateRandXY();
  player.x = x
  player.y = y
  scene.physics.resume();

  player.setTint();
}
function update() {
  startPlayerMovement();
  initBombFollow(this);
  spinCoins();
  mummy.anims.play('walk', true);

  // let bombToDestroy = bombs.get()[Phaser.Math.Between(0, bombs.get().length - 1)]

  // if (Math.random() > 0.8){
  //   bombs.remove(bombToDestroy, true, true)
  // }
}
function spinCoins(){
  coins.children.iterate(function (child) {
    child.anims.play('spin', true)
  });
}
function initBombFollow(scene){
  physics = scene.physics
  bombs.children.iterate(function (bomb) {
    if (bomb.body.touching.left) {
      bomb.setVelocityX(160);
      physics.moveToObject(bomb, player, ENEMY_VELOCITY)
    }
    else if (bomb.body.touching.right) {
      bomb.setVelocityX(-160);
      physics.moveToObject(bomb, player, ENEMY_VELOCITY)
    }
    else {
      physics.moveToObject(bomb, player, ENEMY_VELOCITY)
    }
  })
}
function startPlayerMovement() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  }
  else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  }
  else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }
  doubleJump();
}

function doubleJump(){
  const isJumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up)
  if (isJumpJustDown && (player.body.touching.down || jumpCount < 2)) {
    player.setVelocityY(-400)
    jumpCount++;

    if (jumpCount > 2) {
      jumpCount = 0;
    }
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (coins.countActive(true) === 0) {
    coins.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    dropBomb();
  }
}

function onGameover(scene){
  const GAMEOVER_FEEDBACK_TEXT = "GAMEOVER! 😭"
  const X_OFFSET = 50;
  const CENTER_X = (WIDTH / 2) - X_OFFSET
  const CENTER_Y = HEIGHT / 2;
  const text = scene.add.text(CENTER_X, CENTER_Y, GAMEOVER_FEEDBACK_TEXT, {
    fontSize: '18px', fill: '#fff'
  })
  $.post(SCORE_ROUTE, {score}, function(res){
    console.log(res);
  })
  .fail(err => console.warn(err))
  setTimeout(function () {
    psuedoRestart(scene, text);
  }, 2500)

  gameover = true
}
/*
  psuedoRestart needs to be called instead of restart the scene (the game)
  other wise the map gets re-rendered in different coordinates.
*/
function psuedoRestart(scene, gameoverText){
  score = 0;
  dropStars(scene);
  resetPlayer(scene);
  if(gameoverText !== undefined)
    gameoverText.destroy();
  scoreText.destroy();
  scoreText = scene.add.text(16, 16, 'Score : 0', {
    fontSize: '32px', color: '#fff'
  });
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);
  player.anims.play('turn');

  onGameover(this);
}

function dropBomb() {
  let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  bombs.create(x, 16, 'bomb');
}

function generateRandXY(){
    let randomCoordValY = Phaser.Math.Between(100, HEIGHT - 100)
    let randomCoordValX = Phaser.Math.Between(0, WIDTH)
    return { x: randomCoordValX, y: randomCoordValY }
}

/*
Notes:
  1. Important values!
    1a. The width of the generated rectangle doesnt compare the changing
        platform sprites display width so I need to feed the rectangle instances width
        with those values
    2a. Failure count doesnt seem to do much.
    3a. ROW_COUNT doesnt seem to do much either.
    4a. Test everything when we get the chance.
*/

function renderPlatforms(){
  let platformRows = [];

  const ROW_COUNT = 10;
  let currentPlatform;
  let previousPlatform;
  const {dw, dh} = getPlatformDHDW(platforms)
  platforms.clear(true)
  for (let r = 0; r < ROW_COUNT; r++) {
    /*
      Init these variables at the top of the loop
      so they get reset through every iteration.

      +1 to r so that it skips the first row
    */
    let failureCount = 0;
    const y = (r + 1) * dh;
    let useable = false;
    while (!useable) {
      const randX = generateRandXY().x;
      // Checking to make sure no platform get's placed
      // on the fixed bottom platform
      if(isChoppedBottomRow(y, dh)){
        currentPlatform = new Phaser.Geom.Rectangle(randX, y, dw, dh);
        previousPlatform = platformRows[r - 1];
      }
      // Checking for empty data
      if(r > 0 && previousPlatform !== null){
        // If the current platform intersects with the previously generated platform
        // then increment the failure count. If it fails to many times break out of the loop
        if (!Phaser.Geom.Intersects.RectangleToRectangle(currentPlatform, previousPlatform)) {
          useable = true;
        }else{
          failureCount++;
          if (failureCount > 10) {
            break;
          }
        } // closing else for not being useable
      }else{
        break;
      }
    }
    if (failureCount <= 10) {
      platformRows.push(currentPlatform)
    } else {

      platformRows.push(null);
    }
}
  /*
    Loop through each platform and render them to the canvas
    based on rectangle coords above. Also generates random
    widths
  */
  createAllPlatforms(platformRows)
  postPlatformData();

  return platformRows
}
function createAllPlatforms(platformRows){
  platformRows.forEach(function (rectangle) {
    let plat;
    if (rectangle != null) {
      plat = platforms.create(rectangle.x, rectangle.y, 'ground');
    }
    if (plat !== undefined) {
      plat.displayWidth = Phaser.Math.Between(100, 300);
      plat.refreshBody();
    }
  })

}
function postPlatformData(){
  let platformData = []
  platforms.children.iterate(function (child) {
    platformData.push({
      width: child.displayWidth,
      height: child.displayHeight,
      x: child.x,
      y: child.y
    })
  })
  $.post(POST_PLATFORM_ROUTE, { platforms: JSON.stringify(platformData) }, function (res) {
    console.log(res);
  }, 'json')
    .fail(err => console.warn(err)
  );
}
function isChoppedBottomRow(yAxis, floorPlatformHeight){
  return yAxis < (HEIGHT - floorPlatformHeight * 2)
}
/*
  Gets platform sprite display height and
  display width.
*/
function getPlatformDHDW(platforms){
  let dh, dw
  if(platforms !== undefined){
    platforms.children.iterate(function (child) {
      dh = child.displayHeight;
      dw = child.displayWidth;
    })
  }
  return {dh, dw}
}

function getNextArrayItem(array = [], index){
  return array[(index + 1) % array.length]
}


$(document).ready(function(){
  $("#map-button").on("click", function(){
    renderPlatforms();
    scene.scene.restart();
    location.reload();
  })
})
