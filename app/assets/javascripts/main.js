
const WIDTH = 800;
const HEIGHT = 600;
const Y_GRAVITY = 300;
const ENEMY_VELOCITY = 50;

let config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    physics : {
      default : 'arcade',
      arcade : {
        gravity : { y : Y_GRAVITY },
        debug : false
      }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload () {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude',
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );
}

let platforms;
let player;
let score = 0;
let scoreText;
let bombs;
let bomb;
let stars;

function create () {

  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // console.log(platforms)

  player = this.physics.add.sprite(100, 450, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(200)

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{key: 'dude', frame: 4}],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1
  });

  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: {x: 12, y: 0, stepX: 70}
  });

  stars.children.iterate(function(child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);

  scoreText = this.add.text(16, 16, 'Score : 0', {
    fontSize : '32px', fill: '#000'
  });

  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);

  dropBomb();
}

function update () {
  startPlayerMovement();
  if (bomb.body.touching.left){
    bomb.setVelocityX(160);
    this.physics.moveToObject(bomb, player, ENEMY_VELOCITY)
  }
  else if (bomb.body.touching.right){
    bomb.setVelocityX(-160);
    this.physics.moveToObject(bomb, player, ENEMY_VELOCITY)
  }
  else{
    this.physics.moveToObject(bomb, player, ENEMY_VELOCITY)
  }
}

function startPlayerMovement(){
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

function collectStar (player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function(child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    dropBomb();
  }
}

function hitBomb (player, bomb) {
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

function dropBomb(){
  let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  bomb = bombs.create(x, 16, 'bomb');
}