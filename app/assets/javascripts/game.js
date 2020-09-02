const WIDTH = 800;
const HEIGHT = 600;
const Y_GRAVITY = 300;
const ENEMY_VELOCITY = 50;

let config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  scale: {
    parent: 'CanvasDiv',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    isPortrait: true
  },
  dom: {
    createContainer: true
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

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude',
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );

  this.load.spritesheet('mummy',
    'assets/mummy.png',
    { frameWidth: 37, frameHeight: 45 }
  );



}

let scene;
let platforms;
let player;
let enemy
let scene; 
let score = 0;
let scoreText;
let bombs;
let bomb;
let stars;
let gameover = false

function create() {
  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();
  platforms.create((WIDTH / 2), (HEIGHT / 2) + 50, 'ground')
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(200);
  let graphics = this.add.graphics();
  path = this.add.path(700, 513);
  path.lineTo(100, 513);
  path.lineTo(700, 513);
  follower = this.add.follower(path, 700, 513, 'mummy').startFollow({
    duration: 8000,
    loop: -1
  });
  scene = this
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(follower, player);
  cursors = this.input.keyboard.createCursorKeys();
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  scoreText = this.add.text(16, 16, 'Score : 0', {
    fontSize: '32px', fill: '#000'
  });
  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
  dropBomb();
  if (!gameover){
    renderPlatforms(4, player)
  }
}

function update() {
  startPlayerMovement();
  let physics = this.physics
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

  //renderPlatforms(4, player, this)
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
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500)
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    dropBomb();
  }
}

function onGameover(scene){
  const GAMEOVER_FEEDBACK_TEXT = "GAMEOVER YOU SUCK! MAYBE CONSIDER NOT SUCKING?"
  const X_OFFSET = 220;
  const Y_OFFSET = 20;
  const CENTER_X = (WIDTH / 2) - (GAMEOVER_FEEDBACK_TEXT.length / 2) - X_OFFSET
  const CENTER_Y = (HEIGHT / 2) - (GAMEOVER_FEEDBACK_TEXT.length / 2) + Y_OFFSET
  console.log(this);
  scene.add.text(CENTER_X, CENTER_Y, GAMEOVER_FEEDBACK_TEXT, {
    fontSize: '18px', fill: '#000'
  })
  setTimeout(function () {
    score = 0;
    scene.scene.restart();
  }, 2500)

  gameover = true
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
function generateVectors(vectorCount){
  let vectorArr = [];
  for (let i = 0; i < vectorCount; i++) {
    vectorArr.push(generateRandXY());
  }
  return vectorArr.sort(function(a, b){
    return b.x - a.x;
  });
}

function renderPlatforms(platformLimit, player){
  let x = 0, y = 0;
  let allRect = []
  let isFitted = false, isOverlapped = false;
  let h, w
  platforms.children.iterate(function(child){
    h = child.displayHeight;
    w = child.displayWidth;
  })

  for (let currentRow = 0; currentRow < platformLimit; currentRow++) {
    x = generateRandXY().x;
    y = generateRandXY().y;

    let rect = new Phaser.Geom.Rectangle(x, y, w, h)
    allRect.push(rect)

    let currentRect = allRect[currentRow];
    let nextRect = getNextArrayItem(allRect, currentRow);

    if (allRect.length > 1){
      isOverlapped = Phaser.Geom.Intersects.RectangleToRectangle(currentRect, nextRect)
      if (isOverlapped){
        for (let currentRect = 0; currentRect < allRect.length; currentRect++) {
          x = generateRandXY().x;
          y = generateRandXY().y;
          rect = new Phaser.Geom.Rectangle(x, y, w, h);
          allRect.pop();
          allRect.push(rect);
        }
      }
      if ((Math.abs(currentRect.y - nextRect.y)) > player.displayHeight * 2 && !isOverlapped) {
        allRect.push(currentRect)
      }
    }
    console.log(isOverlapped);
  }
  if(!isOverlapped){
    console.log(allRect);
    for (let r = 0; r < allRect.length; r++) {
      let plat = platforms.create(allRect[r].x, allRect[r].y, 'ground');
      plat.displayWidth = Phaser.Math.Between(10, 500);
      plat.refreshBody();
    }
  }
}

function getNextArrayItem(array = [], index){
  return array[(index + 1) % array.length]
}
