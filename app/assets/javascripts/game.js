const WIDTH = 800;
const HEIGHT = 600;
const Y_GRAVITY = 300;
const ENEMY_VELOCITY = 50;
const SCORE_POST_ROUTE = '/highscore'

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
let rows;

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

let centerPlat
let scene;
let platforms;
let player;
let enemy
let score = 0;
let scoreText;
let bombs;
let bomb;
let stars;
let gameover = false;
let jumpCount = 0;

function create() {
  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();
  //centerPlat = platforms.create((WIDTH / 2), (HEIGHT / 2) + 50, 'ground')

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
  renderPlatforms();
}

function dropStars(scene){
  stars.clear(true);
  bombs.clear(true)
  stars = scene.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  scene.physics.add.collider(stars, platforms);
  scene.physics.add.overlap(player, stars, collectStar, null, this);

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

  const isJumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up)
  jumpCount = 0;
  if (isJumpJustDown && (player.body.touching.down || jumpCount < 2)) {
    player.setVelocityY(-400)

    jumpCount++
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
  const text = scene.add.text(CENTER_X, CENTER_Y, GAMEOVER_FEEDBACK_TEXT, {
    fontSize: '18px', fill: '#000'
  })
  setTimeout(function () {
    score = 0;
    dropStars(scene);
    resetPlayer(scene);
    text.destroy();
    scoreText.destroy();
    scoreText = scene.add.text(16, 16, 'Score : 0', {
      fontSize: '32px', fill: '#000'
    });
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

// function renderPlatforms(platformLimit, player){
//   let x = 0, y = 0;
//   let allRect = []
//   let isFitted = false, isOverlapped = false;
//   let h, w
//   platforms.children.iterate(function(child){
//     h = child.displayHeight;
//     w = child.displayWidth;
//   })

//   for (let currentRow = 0; currentRow < platformLimit; currentRow++) {
//     x = generateRandXY().x;
//     y = generateRandXY().y;

//     let rect = new Phaser.Geom.Rectangle(x, y, w, h)
//     allRect.push(rect)

//     let currentRect = allRect[currentRow];
//     let nextRect = getNextArrayItem(allRect, currentRow);

//     if (allRect.length > 1){
//       isOverlapped = Phaser.Geom.Intersects.RectangleToRectangle(currentRect, nextRect)
//       if (isOverlapped){
//         for (let currentRect = 0; currentRect < allRect.length; currentRect++) {
//           x = generateRandXY().x;
//           y = generateRandXY().y;
//           rect = new Phaser.Geom.Rectangle(x, y, w, h);
//           allRect.pop();
//           allRect.push(rect);
//         }
//       }
//       if ((Math.abs(currentRect.y - nextRect.y)) > player.displayHeight * 2 && !isOverlapped) {
//         allRect.push(currentRect)
//       }
//     }
//     console.log(isOverlapped);
//   }// End of rows loop
//     console.log(allRect);
//     if (!isOverlapped){
//       for (let r = 0; r < allRect.length; r++) {
//         let plat = platforms.create(allRect[r].x, allRect[r].y, 'ground');
//         plat.displayWidth = Phaser.Math.Between(10, 500);
//         plat.refreshBody();
//       }
//     }
// }

/*
const platformRows = []; // all the useable added platforms
const numberOfRows = 20;
for(let i=0; i < numberOfRows; i++){
  1. nothing, sorry
  2.  useable = false
  2a. failureCount = 0;
  3. while !useable
     3a. platform = random platform with random x,y, random width
     3b. if platform does NOT overlap with platform on row above
           (
            "platform on row above" =
             you will have to get platformRows[i-1], except not when i=0
             and ALSO make sure that the element is not null (i.e. nothing on this row)
           )
           useable = true
         end
         failureCount++;
         if failureCount > 30  // more than 30? less?
           break; // break out of loop! too many tries
         end if
  (3) end while !useable
  4. if failureCount <= 30
        platformRows.push( platform )
      else
        // placeholder, so that we always have numberOfRows items in platformRows
        platformRows.push( null )
      end
     // i.e. sometimes you won't add a platform to a row at all!
} //end for each row
for each platform in platformRows
  add it to the map/game (create)
end

Notes:
  1. Important values!
    1a. The width of the generated rectangle doesnt compare the changing
        platform sprites display width so I need to feed the rectangle instances width
        with those values
    2a. Failure count doesnt seem to do much

*/
function renderPlatforms(){
  let platformRows = [];

  const ROW_COUNT = 100;
  let currentPlatform;
  let previousPlatform;


  const {dw, dh} = getPlatformDHDW(platforms)
  console.log(dw, dh)
  for (let r = 0; r < ROW_COUNT; r++) {
    console.log("row = ", r, "****************************");
    let failureCount = 0;
    const y = (r + 1) * dh;
    let useable = false;
    while (!useable) {
      const randX = generateRandXY().x;
      const randY = generateRandXY().y;
      console.log({ randX, y, dw, dh});
      currentPlatform = new Phaser.Geom.Rectangle(randX, y, dh * failureCount, dh);
      console.log(currentPlatform, randX, randY)
      // Checking for empty data
      previousPlatform = platformRows[r - 1];

      if(r > 0 && previousPlatform !== null){
        // If the current platform intersects with the previously generated platform
        // then increment the failure count. If it fails to many times break out of the loop
        console.log({currentPlatform, previousPlatform});
        console.log(!Phaser.Geom.Intersects.RectangleToRectangle(currentPlatform, previousPlatform));
        if (!Phaser.Geom.Intersects.RectangleToRectangle(currentPlatform, previousPlatform)) {
          useable = true;
        }else{
          failureCount++;
          console.log({ failureCount })
          if (failureCount > 100) {
            break;
          }
        } // closing else for not being useable
      }else{
        console.log("null break", "r > 0", r > 0, "previousPlatform", previousPlatform === null)
        break;
      }
    }

    if(platformRows !== undefined){
      if (failureCount <= 100) {
        platformRows.push(currentPlatform)
      } else {
        console.log("Pushing null");
        platformRows.push(null);
      }
    }
  }
  /*
    Loop through each platform and render them to the canvas
    based on rectangle coords above. Also generates random
    widths
  */
  platformRows.forEach(function (rectangle) {
    let plat;
    if (rectangle != null){
      console.log({rectangle});
      plat = platforms.create(rectangle.x, rectangle.y, 'ground');
    }
    if(plat !== undefined){
      plat.displayWidth = Phaser.Math.Between(100, 300);
      plat.refreshBody();
    }
  })

  return platformRows
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
