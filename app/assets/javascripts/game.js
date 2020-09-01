const WIDTH = 800;
const HEIGHT = 600;
const Y_GRAVITY = 300;
const ENEMY_VELOCITY = 50;

let config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
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
    {frameWidth: 37, frameHeight: 45}
  );
}

let platforms;
let player;
let enemy;
let score = 0;
let scoreText;
let bombs;
let bomb;
let stars;

function create() {

  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  // console.log(platforms)

  player = this.physics.add.sprite(100, 450, 'dude');
  enemy = this.physics.add.sprite(700, 450, 'mummy');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(200);

  enemy.setBounce(0.2);
  enemy.setCollideWorldBounds(true);
  enemy.body.setGravityY(200);

  console.log(player.displayWidth);

  renderPlatforms(4, player, this)

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
  this.physics.add.collider(enemy, platforms);
  this.physics.add.collider([platforms])

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

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);
  player.anims.play('turn');

  const GAMEOVER_FEEDBACK_TEXT = "GAMEOVER YOU SUCK! MAYBE CONSIDER NOT SUCKING?"
  const X_OFFSET = 220;
  const Y_OFFSET = 20;
  const CENTER_X = (WIDTH / 2) - (GAMEOVER_FEEDBACK_TEXT.length / 2) - X_OFFSET
  const CENTER_Y = (HEIGHT / 2) - (GAMEOVER_FEEDBACK_TEXT.length / 2) + Y_OFFSET
  console.log(this);
  this.add.text(CENTER_X, CENTER_Y, GAMEOVER_FEEDBACK_TEXT, {
    fontSize: '18px', fill: '#000'
  })
  let scene = this.scene
  setTimeout(function () {
    score = 0;
    scene.restart();
  }, 2500)
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
    vectorArr.push(generateRandXY);
  }
  return vectorArr;
}
function renderPlatforms(platformLimit, player, scene){
  let x = 0, y = 0;
  let platformsCheckOverlap = [], platformVectors = generateVectors(platformLimit);
  let isOverlapping = false, isSpaceBetween = false;
  for (let i = 0; i < platformLimit; i++) {
    x = generateRandXY().x
    y = generateRandXY().y
    platformVectors.push({x, y})
    let nextItem = getNextArrayItem(platformVectors, i)
    let currentItem = platformVectors[i];
    let platformIncrementor = 0;

    if ((Math.abs(currentItem.y - nextItem.y)) > player.displayHeight){
      let platform = platforms.create(x, y, 'ground')
      platformsCheckOverlap.push(platform);
      platformIncrementor++;
      if (platformsCheckOverlap.length > 1){
        let currentPlatform = platformsCheckOverlap[platformIncrementor]
        let nextPlatform = getNextArrayItem(platformsCheckOverlap, platformIncrementor)
        console.log(currentPlatform.body.touching)
        scene.physics.add.overlap(currentPlatform, nextPlatform, function(){
          platforms.remove(currentPlatform, true, true);
          platforms.remove(nextPlatform, true, true);
          isOverlapping = true
        })
      }
    }
    console.log(isOverlapping)
    if (isOverlapping){
      x = generateRandXY().x
      y = generateRandXY().y
      platforms.create(x, y, 'ground')
    }
    console.log(`X coord: ${x}, Y coord: ${y}, Y Distance: ${(Math.abs(currentItem.y - nextItem.y))}`);
    //onsole.log((platformVectors[i].y - nextItem.y));
  }
}

function getNextArrayItem(array = [], index){
  return array[(index + 1) % array.length]
}
