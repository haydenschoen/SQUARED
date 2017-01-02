'use strict'

//SQRS

var filter;

//scripts
var b, t, su, d;
//window
var OFF_SCREEN = -100;
var state, windowWidth, windowHeight,
  windowWidthHalf, windowHeightHalf, sf;
//RENDERING
var renderer, stage, gameCanvas;
//background
var background;
//menu
var LOGO_SIZE = 168;
var LOGO_TOP_PADDING = 90;
var MENU_BUTTON_HEIGHT = 94;
var MENU_BUTTON_WIDTH = 168;
var MENU_BUTTON_TOP_PADDING = 126;
var menuButtonStates = [], graphicStates = [], menuContainer, gLogo, gPause, gGameOver, gHiScore, gContainer;
//game grid
var STD_PADDING = 16;
var GRID_SEGMENTS = 12;
var gridBG, gridSize, gridMatrix = [], gridBlocks = [], gridZoneWidth, gridZoneHeight;
//interaction
var TOUCH_SLOP = 20;
var UNLOCK_THRESHOLD = 3;
var TOUCH_MULTIPLIER = 1.6;
var touchLayer, touchInit, touchmove, mSlideInd,
  touching, touchChangeX, touchChangeY, touchNew, movingCid = false,
  unlocking = false, stunned = false, tappingButton = false, dropEnabled = false;
//collision
var axisLockX = false, axisLockY = false;
//buttons
var TOP_BAR_HEIGHT = 110;
var BOTTOM_BAR_HEIGHT = 202;
var BOTTOM_BUTTON_HEIGHT = 98;
var NAVBAR_PAD = 48;
var BUTTON_RADIUS = 6;
var STATUSBAR_PAD = 25;
var rotateLeft, rotateRight, drop, pauseButton, bigButtonWidth, bigButtonHeight,
  smallButtonWidth, smallButtonHeight;
//swap
var SWAP_BLOCK_SIZE = 8;
var SWAP_BLOCK_RADIUS = 1;
var SWAP_BLOCK_PADDING = 1;
var swapButton, swapMatrix = [], swapBlocks = [], swapText, swapContainer,
  swapEmpty = true, swapOnTurn = false, swapBrick;
//Squares
var MINIMUM_SQUARE_SIZE = 3;
var squareCornerRanges = [];
//removing
var blocksToRemove = [];
//BRICKS
var brickDim, placedBricksContainer, liveBricksContainer,
livePiece, livePieceRot, gridContainer, posInit, liveMatrix = [], liveBlocks = [],
nextMatrix = [], nextBlocks = [], nextContainer;
//block styles
var BLOCK_RADIUS = 3;
var BLOCK_PADDING = 1;
var BLOCK_SHADOW_HEIGHT_SMALL = 4;
var BLOCK_SHADOW_HEIGHT_LARGE = 7;
var BLOCK_ANIM_DELAY = 0.02;
var BLOCK_ANIM_OUT_SPEED = 0.2;
//text styles
var subHeadStyle, largeNumberStyle, buttonTextStyleSmall, buttonTextStyleLarge,
  hiScoreLabelStyle, hiScoreNumberStyle;
//text size
var smallTextSize, largeTextSize, largeMenuButtonTextSize, hiScoreLabelSize,
  hiScoreNumberSize;
//leveling
var NUM_PER_LEVEL = 100;
var levelContainer, levelLabel, levelNumber, level = 1;
//score
var POINTS_PER_BLOCK = 5;
var SUBHEAD_OFFSET = 5;
var resetTapCount = 0;
var RESET_TAP_LIMIT = 4;
var totalCleared = 0, scoreContainer, scoreLabel, scoreNumber, score = 0,
  hiScore, hiScoreNumber, scoreLabelStyle, scoreTextStyle, resetScoreButton;
//multiplier
var multiplier = 1, chain = false;
//score popup
var POPUP_VISIBLE_TIME = 2; //inseconds
var scorePopupStyle, scorePopupContainer, scorePopupPosition;
//timer
var TIMER_START_LENGTH = 14;
var TIMER_INCREMENT = 1;
var TIMER_HEIGHT = 6;
var timerContainer, timerBG, timerIndicator,
  timerMult = 1, timerEnd = false;
//time
var elapsedTime = 0, time, nextTimerEnd, timerLength;
//PAUSE
var isPaused = true, isGameOver = false;
//BRICK TYPES
var BRICK_TYPES = [
  [ [1,0,0],
    [1,0,0],
    [1,1,1]  ],

  [ [0,0,1],
    [0,0,1],
    [1,1,1]  ],

  // [ [0,1,0],
  //   [1,1,1],
  //   [0,0,0]  ],

  // [ [0,1,1],
  //   [1,1,0],
  //   [0,0,0]  ],
  //
  // [ [1,1,0],
  //   [0,1,1],
  //   [0,0,0]  ],

  [ [1,1,1],
    [1,0,0],
    [1,1,1]  ],

  [ [1,0,0],
    [1,1,1],
    [1,0,0]  ],

  [ [0,1,0],
    [0,1,1],
    [0,0,0]  ],

  [ [1,1,0],
    [1,1,1],
    [1,1,0]  ],

  [ [0,0,1],
    [1,1,1],
    [1,0,0]  ],

  [ [1,0,0],
    [1,1,1],
    [0,0,1]  ],

  [ [1,1,1],
    [1,0,1],
    [0,0,0]  ],

  [ [0,1,0],
    [0,1,0],
    [0,1,0]  ]
]
var brickBag;
//platform
var isMobile = false;

//Aliases
var Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  Rect = PIXI.Rectangle,
  g = PIXI.Graphics,
  tick = PIXI.ticker.Ticker;

checkMobile();

function checkMobile(){
  if(typeof EVENTS == 'undefined'){
    //Create the renderer
    //this is only used for previewing on desktop
    renderer = autoDetectRenderer(360, 640, {antialias: true,
      resolution: window.devicePixelRatio});
    // console.log('ratio: ' + window.devicePixelRatio);
    // renderer.options = {antialias: true};
    renderer.backgroundColor = 0xF4F4FC;
    renderer.view.style.position = 'absolute';
    renderer.view.style.display = 'block';
    renderer.autoResize = true;
    // renderer.antialias = true;
    renderer.resize(window.innerWidth, window.innerHeight);

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    //Create a container object called the 'stage'
    stage = new Container();

    loadAssets();

  } else {
    console.log('events are DEFINED, we are go for mobile and to wait for init');
    isMobile = true;
  }
}

//Load all image assets
function loadAssets(){
  loader
    .add([
      'img/downArrow.png',
      'img/leftArrow.png',
      'img/rightArrow.png',
      'img/pauseSymbol.png',
      'img/sqrd_Logo.png',
      'img/sqrd_pauseGraphic.png',
      'img/sqrd_instructions.png',
      'img/sqrd_gameOverGraphic.png',
      'img/sqrd_hiScoreGraphic.png',
    ])
    .on('progress', loadProgressHandler)
    .load(getScripts); //after completing load all scripts
}


//after each image is loaded, fire off this function as a progress indicator
function loadProgressHandler(){
  console.log('loading');
}

//side load all required script files
function getScripts(){
  //list all scripts needed
  console.log('loading scripts');
  var scriptsToLoad = [
    'libs/TweenLite.js',
    'libs/TimelineLite.js'];
  scriptsToLoad.forEach(function(src) {
    var script = document.createElement('script');
    script.src = src;
    script.async = false;

    //if we are at the end of the array, run the setup function
  	if (scriptsToLoad[scriptsToLoad.length - 1] == src) {
  		script.onload = function () {
        //we finished loading all of the scripts, start the setup
  			setup();
  		}
  	}
    document.head.appendChild(script);
  });
}

//////////////////////////////////////////////////////////////////// !SETUP

//init is called from live lock screen source, it will replace the stage and
//renderer with its own versions
function init(s, r){
  console.log('init');
  stage = s;
  renderer = r;

  ACTIONS.setInteractivity(true);

  EVENTS.onPause = pauseOnEvent;

  // EVENTS.onResume = setResume;

  EVENTS.onLockScreenDismissed = pauseOnEvent;

  loadAssets();
}

function setup(){
  PIXI.RESOLUTION = window.devicePixelRatio;

  //changing the state variable will change what happens during the game loop
  state = pause;

  //setup ticker to keep track of time
  time = new tick();
  time.start();

  //get window dimensions, used everywhere for varying screen sizes
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  windowWidthHalf = windowWidth / 2;
  windowHeightHalf = windowHeight / 2;

  hiScore = getHiScore();

  console.log("hiscore: " + hiScore);

  //setup a multiplier to ensure all sizes the same on all screen sizes
  sf = getScaleFactor();

  scaleConstants();

  makeBackground();

  makeTouch();

  setupGameCanvas();

  makeGrid();

  setTextStyle();

  makeTimer();

  makeScorePopup();

  //create array to determine where blocks have been placed
  createGridMatrix();

  updateGridBlocks();

  setupBrickBag();

  createLivePiece();

  createNextPiece();

  newNextPiece(getBrickFromBag());

  newLivePiece(getBrickFromBag());

  makeButtons();

  createSwap();

  makeScoreIndicator();

  makeLevelIndicator();

  resetTimer();

  createMenu();

  createInstructions();

  createMovePrompt();

  lockShield();

  //Tell the 'renderer' to 'render' the 'stage'
  renderer.render(stage);

  gameLoop();

}

//////////////////////////////////////////////////////////////////// !SETUP
function makeBackground(){
  background = new g;
  background.beginFill(0xFFFFFF)
  background.drawRect(0, 0, windowWidth, windowHeight);
  stage.addChild(background);
}

function lockShield(){
  var lockShield = new g;
  lockShield.beginFill(0xbebebe);
  var size = 60 * sf;
  var lsX = windowWidthHalf - size / 2;
  var lsY = windowHeight - NAVBAR_PAD - 4 * sf;
  var rad = NAVBAR_PAD * .15;
  lockShield.drawRoundedRect(lsX, lsY, size, size, rad);
  stage.addChild(lockShield);
}

function setupGameCanvas(){
  gameCanvas = new Container();
  stage.addChild(gameCanvas);
}

function makeTouch(){
  touchLayer = new g;
  touchLayer.beginFill(0x00ff00);
  touchLayer.drawRect(0,0,windowWidth, windowHeight);
  touchLayer.alpha = 0;
  stage.addChild(touchLayer);

  //setInteractEvents(element, start, end, move)
  setInteractEvents(touchLayer, onTouchStart, onTouchEnd, onTouchMove);
}

function makeGrid(){
  //get area the grid can fit and center inside
  gridZoneWidth = windowWidth - (STD_PADDING * 2);
  gridZoneHeight = windowHeight - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT;

  //check for which dimension is smaller and make that the gridSize
  if(gridZoneWidth < gridZoneHeight){
    gridSize = gridZoneWidth;
  } else {
    gridSize = gridZoneHeight;
  }

  brickDim = gridSize / GRID_SEGMENTS;
  console.log('brickDim: ' + brickDim);

  //create the containers for the bricks
  gridContainer = new Container();
  //create variables that center the grid in the gridZone
  var gridX = windowWidthHalf - gridSize / 2;
  var gridY = ((gridZoneHeight / 2) - (gridSize / 2)) + TOP_BAR_HEIGHT;
  gridContainer.position.set(gridX, gridY);
  gameCanvas.addChild(gridContainer);

  for(var i = 0; i < GRID_SEGMENTS; i++){
    for(var t = 0; t < GRID_SEGMENTS; t++){

      //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
      var block = makeBlock(brickDim, brickDim, BLOCK_PADDING, BLOCK_RADIUS, 0xE2ECF2);

      block.position.set(brickPos(t), brickPos(i));

      gridContainer.addChild(block);
      // console.log('array val: ' + i + ' ' + t + ' ' + gridMatrix[i][t]);
    }
  }

  makeStartArea();

  nextContainer = new Container();
  var nextX = 0;
  var nextY = brickPos(GRID_SEGMENTS - 3);
  nextContainer.position.set(nextX, nextY);
  gridContainer.addChild(nextContainer);

  placedBricksContainer = new Container();
  gridContainer.addChild(placedBricksContainer);

  liveBricksContainer = new Container();
  gridContainer.addChild(liveBricksContainer);

  livePiece = new Container();
  liveBricksContainer.addChild(livePiece);
}

function makeStartArea(){
  for(var y = GRID_SEGMENTS - 3; y < GRID_SEGMENTS; y++){
    for(var x = 0; x < 3; x++){
      var block = makeBlock(brickDim, brickDim, BLOCK_PADDING, BLOCK_RADIUS, 0xCDDDE7);

      block.position.set(brickPos(x), brickPos(y));

      gridContainer.addChild(block);
    }
  }
}

function createGridMatrix(){
  for(var i = 0; i < GRID_SEGMENTS; i++){
    gridMatrix[i] = [];
    gridBlocks[i] = [];
    for(var t = 0; t < GRID_SEGMENTS; t++){
      // createMatrixBrick(i, t);
      gridMatrix[i][t] = 0;
      var block = gridBlocks[i][t] = createMatrixBrick(i, t);

      addScaleXYProperties(block);

      block.pivot.set(brickDim / 2, brickDim / 2);

      placedBricksContainer.addChild(block);
      // console.log('array val: ' + i + ' ' + t + ' ' + gridMatrix[i][t]);
    }
  }
}

function createMatrixBrick(y, x){

  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  var block = makeBlock(brickDim, brickDim, BLOCK_PADDING, BLOCK_RADIUS, 0xED424A);

  block.position.set(brickPos(x) + brickDim / 2, brickPos(y) + brickDim / 2);

  // console.log('creating brick?' + brickPos(x));
  return block;
}

function updateGridBlocks(){
  for(var y = 0; y < gridMatrix.length; y++){
    for(var x = 0; x < gridMatrix[y].length; x++){
      var blockState = gridMatrix[y][x];
      var block = gridBlocks[y][x];
      if(block.tween != undefined){
        console.log('found tween!');
        if(block.tween.isActive()){
          console.log('activetween!');
          console.log('' + y + ' ' + x);
        } else {
          switch(blockState){
            case 0:
              block.alpha = 0;
              block.scaleX = 1;
              block.scaleY = 1;
              break;
            case 1:
              block.alpha = 1;
              block.scaleX = 1;
              block.scaleY = 1;
              break;
          }
        }
      } else {
        switch(blockState){
          case 0:
            block.alpha = 0;
            block.scaleX = 1;
            block.scaleY = 1;
            break;
          case 1:
            block.alpha = 1;
            block.scaleX = 1;
            block.scaleY = 1;
            break;
        }
      }


    }
  }
}

function setupBrickBag(){
  brickBag = new Array(BRICK_TYPES.length);
  console.log('bag size: ' + brickBag.length);

  for(var i = 0; i < brickBag.length; i++){
    brickBag[i] = BRICK_TYPES[i];
  }
}

function getBrickFromBag(){
  if(brickBag.length == 0){
    setupBrickBag();
  }

  var random = Math.floor(Math.random() * brickBag.length);
  console.log('length: ' + brickBag.length);
  var brick = brickBag[random];

  brickBag.splice(random, 1);
  console.log('length: ' + brickBag.length);

  return brick;

}

function createLivePiece(){

  for(var y = 0; y < 3; y++){
    liveMatrix[y] = [];
    liveBlocks[y] = [];
    for(var x = 0; x < 3; x++){
      //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
      var block = makeBlock(brickDim, brickDim, BLOCK_PADDING, BLOCK_RADIUS, 0x00B1E5, BLOCK_SHADOW_HEIGHT_SMALL, 0x0092D1);

      block.position.set(brickPos(x), brickPos(y));
      livePiece.addChild(block);

      liveMatrix[y][x] = 0;
      liveBlocks[y][x] = block;
    }
  }

  var unitPos = {
    x: 0,
    y: GRID_SEGMENTS - 3
  }

  livePiece.position.set(unitPos.x, unitPos.y * brickDim);

  printMatrix(liveMatrix);

}

function createNextPiece(){
  for(var y = 0; y < 3; y++){
    nextMatrix[y] = [];
    nextBlocks[y] = [];
    for(var x = 0; x < 3; x++){
      //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
      var block = makeBlock(brickDim, brickDim, BLOCK_PADDING, BLOCK_RADIUS, 0x7F9BAF);

      block.position.set(brickPos(x), brickPos(y));
      nextContainer.addChild(block);

      nextMatrix[y][x] = 0;
      nextBlocks[y][x] = block;
    }
  }

  var unitPos = {
    x: 0,
    y: GRID_SEGMENTS - 3
  }

  nextContainer.position.set(unitPos.x, unitPos.y * brickDim);
}

function newNextPiece(matrix){
  nextMatrix = matrix;

  TweenLite.killTweensOf(nextContainer);
  nextContainer.alpha = 0;

  for(var y = 0; y < matrix.length; y++){
    for(var x = 0; x < matrix[y].length; x++){
      switch(nextMatrix[y][x]){
        case 0:
          nextBlocks[y][x].alpha = 0;
          break;
        case 1:
          nextBlocks[y][x].alpha = 1;
          break;
      }
    }
  }


}

function hideNextPiece(){
  TweenLite.killTweensOf(nextContainer);
  nextContainer.alpha = 0;
}

function newLivePiece(matrix){

  printMatrix(matrix);

  liveMatrix = matrix;

  for(var y = 0; y < matrix.length; y++){
    for(var x = 0; x < matrix[y].length; x++){
      switch(liveMatrix[y][x]){
        case 0:
          liveBlocks[y][x].alpha = 0;
          break;
        case 1:
          liveBlocks[y][x].alpha = 1;
          break;
      }
    }
  }

  var startPos = {
    x: 0,
    y: GRID_SEGMENTS - 3
  }

  livePiece.position.set(startPos.x, startPos.y * brickDim);

  if(checkCollide(liveMatrix, startPos)){
    console.log('piece was going to collide, resetting');
    // resetGame();

    gameOver();
  }
}

function updateLivePiece(){
  printMatrix(liveMatrix);
  for(var y = 0; y < liveMatrix.length; y++){
    for(var x = 0; x < liveMatrix.length; x++){
      switch(liveMatrix[y][x]){
        case 0:
          liveBlocks[y][x].alpha = 0;
          break;
        case 1:
          liveBlocks[y][x].alpha = 1;
          break;
      }
    }
  }
}

function makeButtons(){
  //set up buttons sizes based on screen size
  bigButtonWidth = (windowWidth - (STD_PADDING * 4)) / 3;
  bigButtonHeight = BOTTOM_BAR_HEIGHT - (STD_PADDING * 3)
    - TIMER_HEIGHT - NAVBAR_PAD;

  smallButtonWidth = 54 * sf;
  smallButtonHeight = 54 * sf;

  makeRotateRightButton();
  makeRotateLeftButton();
  makeDropButton();
  makePause();
}

function createSwap(){
  swapContainer = new Container();
  swapContainer.position.set(STD_PADDING, STD_PADDING + STATUSBAR_PAD);
  gameCanvas.addChild(swapContainer);

  swapButton = new g;
  swapButton.lineStyle(1, 0xB6CEDC, 1.0);
  swapButton.beginFill(0xffffff);
  swapButton.drawRoundedRect(0, 0, smallButtonWidth, smallButtonHeight, BUTTON_RADIUS);

  swapContainer.addChild(swapButton);

  var swapText = new Text('SWAP', subHeadStyle);
  var textX = (smallButtonWidth / 2) - (swapText.width / 2);
  swapText.position.set(textX, SUBHEAD_OFFSET);
  swapContainer.addChild(swapText);

  swapBrick = new Container();
  swapContainer.addChild(swapBrick);

  for(var y = 0; y < 3; y++){
    swapMatrix[y] = [];
    swapBlocks[y] = [];
    for(var x = 0; x < 3; x++){
      //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
      var block = makeBlock(SWAP_BLOCK_SIZE, SWAP_BLOCK_SIZE, SWAP_BLOCK_PADDING, SWAP_BLOCK_RADIUS, 0x00b1e5);

      block.position.set(x * SWAP_BLOCK_SIZE, y * SWAP_BLOCK_SIZE);
      swapBrick.addChild(block);

      swapMatrix[y][x] = 1;
      swapBlocks[y][x] = block;
    }
  }
  var brickX = (smallButtonWidth / 2) - (swapBrick.width / 2);
  swapBrick.position.set(brickX, swapText.y + STD_PADDING);

  swapBrick.alpha = 0.25;

  setInteractEvents(swapContainer, startSwap, pressSwap);

}

function resetSwap(){
  for(var y = 0; y < 3; y++){
    for(var x = 0; x < 3; x++){
      swapMatrix[y][x] = 1;
    }
  }
  updateSwap();
  swapBrick.alpha = 0.25;
  swapEmpty = true;
  swapOnTurn = false;
}

function startSwap(){
  this.isDown = true;
}

function pressSwap(){
  if(this.isDown && !swapOnTurn){
    console.log('pressed swap.');

    if(swapEmpty){
      //beginning of game need to store first piece
      // swapMatrix = liveMatrix.slice();
      for(var y = 0; y < 3; y++){
        for(var x = 0; x < 3; x++){
          swapMatrix[y][x] = liveMatrix[y][x];
        }
      }
      updateSwap();
      newLivePiece(nextMatrix);
      newNextPiece(getBrickFromBag());
      swapEmpty = false;
      swapBrick.alpha = 1;
    } else {
      // var tempMatrix = swapMatrix.slice();
      var tempMatrix = [];
      for(var y = 0; y < 3; y++){
        tempMatrix[y] = [];
        for(var x = 0; x < 3; x++){
          tempMatrix[y][x] = swapMatrix[y][x];
        }
      }
      // swapMatrix = liveMatrix.slice();
      for(var y = 0; y < 3; y++){
        for(var x = 0; x < 3; x++){
          swapMatrix[y][x] = liveMatrix[y][x];
        }
      }
      updateSwap();
      newLivePiece(tempMatrix);
      hideNextPiece();
      // newNextPiece(getBrickFromBag());
    }
    resetTimer();
    swapOnTurn = true;
  }

  // tappingButton = false;
  this.isDown = false;
}

function updateSwap(){
  for(var y = 0; y < swapMatrix.length; y++){
    for(var x = 0; x < swapMatrix.length; x++){
      switch(swapMatrix[y][x]){
        case 0:
          swapBlocks[y][x].alpha = 0;
          break;
        case 1:
          swapBlocks[y][x].alpha = 1;
          break;
      }
    }
  }
}

function makeTimer(){
  timerContainer = new Container();

  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  timerBG = makeBlock(gridSize, TIMER_HEIGHT, 0, 4, 0xE2ECF2);
  timerContainer.addChild(timerBG);

  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  timerIndicator = makeBlock(gridSize, TIMER_HEIGHT, 0, 0.01, 0x00B1E5);
  var timerMask = makeMask(gridSize, TIMER_HEIGHT, 0, 4, 0xE2ECF2);
  //create mask to get rounded corners on indicator as it scales
  timerContainer.addChild(timerMask);
  timerContainer.addChild(timerIndicator);
  timerIndicator.mask = timerMask;

  //position timer centered under the grid
  var timerX = gridContainer.x;
  var timerY = gridContainer.y + gridSize + STD_PADDING;
  timerContainer.position.set(timerX, timerY);
  gameCanvas.addChild(timerContainer);

  addScaleXYProperties(timerIndicator);
}

function setTextStyle(){

  smallTextSize = 10 * sf;
  largeTextSize = 30 * sf;
  largeMenuButtonTextSize = 24 * sf;
  hiScoreLabelSize = 18 * sf;
  hiScoreNumberSize = 36 * sf;

  subHeadStyle = {
    font : 'bold ' + smallTextSize + 'px sans-serif',
    fill : '#9c9c9c',
  }

  largeNumberStyle = {
    font : 'bold ' + largeTextSize + 'px sans-serif',
    fill : '#ED424A',
  }

  buttonTextStyleSmall = {
    font : 'bold ' + smallTextSize + 'px sans-serif',
    fill : 'white',
  }

  buttonTextStyleLarge = {
    font : 'bold ' + largeMenuButtonTextSize + 'px sans-serif',
    fill : 'white',
  }

  hiScoreLabelStyle = {
    font : 'bold ' + hiScoreLabelSize + 'px sans-serif',
    fill : '#666666',
  }

  hiScoreNumberStyle = {
    font : 'bold ' + hiScoreNumberSize + 'px sans-serif',
    fill : '#ED424A',
  }
}

function makeScorePopup(){
  scorePopupStyle = {
    font : 'bold ' + largeTextSize + 'px sans-serif',
    fill : 'white',
    stroke : '#ED424A',
    strokeThickness : 4 * sf,
    align : 'center'
  }

  scorePopupContainer = new Container();
  gameCanvas.addChild(scorePopupContainer);
}

function makeScoreIndicator(){
  scoreContainer = new Container();

  // scoreLabel = new Text('SCORE:', subHeadStyle);

  scoreLabel = new Text('HI-SCORE: ' +
    hiScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), subHeadStyle);

  scoreLabel.y = SUBHEAD_OFFSET;
  scoreContainer.addChild(scoreLabel);



  scoreNumber = new Text('' + 0, largeNumberStyle);
  scoreContainer.addChild(scoreNumber);
  scoreNumber.position.set(0, scoreLabel.height + 4 * sf);

  scoreContainer.position.set(STD_PADDING * 2 + smallButtonWidth, STATUSBAR_PAD + STD_PADDING);

  gameCanvas.addChild(scoreContainer);
}

function makeLevelIndicator(){
  levelContainer = new Container();

  levelLabel = new Text('LEVEL:', subHeadStyle);
  levelLabel.y = SUBHEAD_OFFSET;
  levelContainer.addChild(levelLabel);

  levelNumber = new Text('' + level, largeNumberStyle);
  levelContainer.addChild(levelNumber);
  levelNumber.position.set(0, levelLabel.height + 4 * sf);

  levelContainer.position.set(windowWidth - (STD_PADDING) - (smallButtonWidth * 2), STATUSBAR_PAD + STD_PADDING);

  gameCanvas.addChild(levelContainer);
}

function updateScore(){
  scoreNumber.text = '' + score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateLevel(){
  levelNumber.text = '' + (Math.floor(totalCleared / NUM_PER_LEVEL) + 1);
}

function makeRotateRightButton(){
  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  rotateRight = makeBlock(bigButtonWidth, bigButtonHeight, 0, BUTTON_RADIUS, 0x0E8DB2, BLOCK_SHADOW_HEIGHT_SMALL, 0x096985);

  //position button
  var buttonX = windowWidth - STD_PADDING - bigButtonWidth;
  var buttonY = windowHeight - BOTTOM_BAR_HEIGHT + TIMER_HEIGHT + (STD_PADDING * 2);

  rotateRight.position.set(buttonX, buttonY);
  gameCanvas.addChild(rotateRight);

  //setInteractEvents(element, start, end, move)
  setInteractEvents(rotateRight, buttonStart, tapRotateRight);

  rotateRight.addChild(makeButtonText('TURN RIGHT'));

  rotateRight.addChild(makeButtonIcon(createSprite('img/rightArrow.png')));
}

function makeRotateLeftButton(){

  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  rotateLeft = makeBlock(bigButtonWidth, bigButtonHeight, 0, BUTTON_RADIUS, 0x0E8DB2, BLOCK_SHADOW_HEIGHT_SMALL, 0x096985);

  //position button
  var buttonX = STD_PADDING;
  var buttonY = windowHeight - BOTTOM_BAR_HEIGHT + TIMER_HEIGHT + (STD_PADDING * 2);

  rotateLeft.position.set(buttonX, buttonY);
  gameCanvas.addChild(rotateLeft);

  //setInteractEvents(element, start, end, move)
  setInteractEvents(rotateLeft, buttonStart, tapRotateLeft);

  rotateLeft.addChild(makeButtonText('TURN LEFT'));

  rotateLeft.addChild(makeButtonIcon(createSprite('img/leftArrow.png')));
}

function makeDropButton(){

  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  drop = makeBlock(bigButtonWidth, bigButtonHeight, 0, BUTTON_RADIUS, 0x00B1E5, BLOCK_SHADOW_HEIGHT_SMALL, 0x096985);

  //position button
  var buttonX = windowWidthHalf - (bigButtonWidth / 2);
  var buttonY = windowHeight - BOTTOM_BAR_HEIGHT + TIMER_HEIGHT + (STD_PADDING * 2);

  drop.position.set(buttonX, buttonY);
  gameCanvas.addChild(drop);

  //setInteractEvents(element, start, end, move)
  setInteractEvents(drop, buttonStart, dropPressed);

  drop.addChild(makeButtonText('PLACE PIECE'));

  drop.addChild(makeButtonIcon(createSprite('img/downArrow.png')));
}

function dropPressed(){
  if(this.isDown){

    if(dropEnabled){
      dropPiece();
    } else {
      dropEnabled = true;
    }

    this.hideTop();
    this.isDown = false;
  }
}

function makeButtonIcon(icon){
  icon.width = 54 * sf;
  icon.height = 54 * sf;
  var iconX = (bigButtonWidth / 2) - (icon.width / 2);
  icon.position.set(iconX, 30 * sf);
  return icon;
}

function makeButtonText(text){
  var text = new Text(text, buttonTextStyleSmall);

  text.alpha = 0.6;

  var textX = (bigButtonWidth / 2) - (text.width / 2);
  text.position.set(textX, SUBHEAD_OFFSET * 2);
  return text;
}

function makePause(){
  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  pauseButton = makeBlock(smallButtonWidth, smallButtonHeight, 0, BUTTON_RADIUS, 0x00B1E5, BLOCK_SHADOW_HEIGHT_SMALL, 0x096985);

  //position button
  var buttonX = windowWidth - STD_PADDING - smallButtonWidth;
  var buttonY = STATUSBAR_PAD + STD_PADDING;

  pauseButton.position.set(buttonX, buttonY);
  gameCanvas.addChild(pauseButton);

  //setInteractEvents(element, start, end, move)
  setInteractEvents(pauseButton, buttonStart, pressPause);

  pauseButton.addChild(makePauseIcon(createSprite('img/pauseSymbol.png')));
}

function makePauseIcon(icon){
  icon.width = 40 * sf;
  icon.height = 40 * sf;
  var iconX = (smallButtonWidth / 2) - (icon.width / 2);
  icon.position.set(iconX, iconX);
  return icon;
}

function brickPos(units){
  return brickDim * units;
}

function createMovePrompt(){



}

//////////////////////////////////////////////////////////////////// !MENU

function createMenu(){
  gameCanvas.y = -windowHeight;

  menuContainer = new Container();
  gameCanvas.addChild(menuContainer);
  menuContainer.y = windowHeight;

  gContainer = new Container();
  var gX = windowWidthHalf - LOGO_SIZE / 2;
  var gY = STATUSBAR_PAD + LOGO_TOP_PADDING;
  menuContainer.addChild(gContainer);
  gContainer.position.set(gX, gY);

  makeHiScore();

  createGraphic('img/sqrd_Logo.png');
  createGraphic('img/sqrd_pauseGraphic.png');
  createGraphic('img/sqrd_gameOverGraphic.png');
  createGraphic('img/sqrd_hiScoreGraphic.png');

  createMenuButtons(0x00b1e5, 0x0092D1, startGame, 'START');
  createMenuButtons(0xED424A, 0xBA0710, resumeGame, 'RESUME');

  changeMenuState('logo');
}


function createGraphic(path){
  var g = createSprite(path);
  g.width = 168 * sf;
  g.height = 168 * sf;
  gContainer.addChild(g);

  graphicStates.push(g);
}

function createMenuButtons(color, shadowColor, press, text){
  //makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor)
  var b = makeBlock(MENU_BUTTON_WIDTH, MENU_BUTTON_HEIGHT, 0, BUTTON_RADIUS, color, BLOCK_SHADOW_HEIGHT_LARGE, shadowColor);
  gContainer.addChild(b);

  b.addChild(makeMenuButtonText(b, text));

  var bY = LOGO_SIZE + MENU_BUTTON_TOP_PADDING;
  b.position.set(0, bY);

  //setInteractEvents(element, start, end, move)
  setInteractEvents(b, buttonStart, press);

  menuButtonStates.push(b);
}

function changeMenuState(state){
  for(var i = 0; i < graphicStates.length; i++){
    graphicStates[i].alpha = 0;
  }

  for(var i = 0; i < menuButtonStates.length; i++){
    menuButtonStates[i].alpha = 0;
    menuButtonStates[i].interactive = false;
  }

  switch(state){
    case 'logo':
      graphicStates[0].alpha = 1;
      menuButtonStates[0].alpha = 1;
      menuButtonStates[0].interactive = true;
      break;
    case 'pause':
      menuButtonStates[1].alpha = 1;
      graphicStates[1].alpha = 1;
      menuButtonStates[1].interactive = true;
      break;
    case 'gameOver':
      graphicStates[2].alpha = 1;
      menuButtonStates[0].alpha = 1;
      menuButtonStates[0].interactive = true;
      break;
    case 'hiScore':
      graphicStates[3].alpha = 1;
      menuButtonStates[0].alpha = 1;
      menuButtonStates[0].interactive = true;
      break;
  }
}

function makeMenuButtonText(button, text){
  var text = new Text(text, buttonTextStyleLarge);

  text.alpha = 0.6;

  var textX = (button.width / 2) - (text.width / 2);
  var textY = (button.height / 2) - (text.height / 2)
  text.position.set(textX, textY);
  return text;
}

function createHiScore(){

}

function startGame(){
  if(this.isDown){

    resetGame();
    TweenLite.to(gameCanvas, 0.3, {y: 0, ease: Quad.easeInOut});
    isPaused = false;
    isGameOver = false;
    state = play;

    this.hideTop();
    this.isDown = false;
  }

}

//////////////////////////////////////////////////////////////////// !INSTRUCTIONS

var instructionText, instructionGraphic, instructionsOpen = false;

function createInstructions(){

  instructionText = new Text('HOW TO PLAY', hiScoreLabelStyle);
  instructionText.alpha = 0.3;
  instructionText.position.set(
    windowWidthHalf - instructionText.width / 2,
    539 * sf
  )
  menuContainer.addChild(instructionText);

  var instructionButton = new g;
  instructionButton.beginFill(0x00ff00);
  instructionButton.drawRect(0,0,156 * sf,
    54 * sf);
  instructionButton.position.set(
    windowWidthHalf - instructionButton.width / 2,
    523 * sf
  );
  instructionButton.alpha = 0;
  instructionButton.interactive = true;
  menuContainer.addChild(instructionButton);

  setInteractEvents(instructionButton, instructionStart, instructionPress);

  instructionGraphic = createSprite('img/sqrd_instructions.png');
  instructionGraphic.anchor.set(0.5, 0.5);
  instructionGraphic.width = 304 * sf;
  instructionGraphic.height = 474 * sf;
  instructionGraphic.position.set(windowWidthHalf, windowHeight * 2);
  menuContainer.addChild(instructionGraphic);

  var instructionClose = new g;
  instructionClose.beginFill(0x00ff00);
  instructionClose.drawRect(0,0,54 * sf,
    54 * sf);
  instructionClose.position.set(
    windowWidthHalf - instructionClose.width / 2,
    1030 * sf
  );
  instructionClose.alpha = 0;
  instructionClose.interactive = true;
  menuContainer.addChild(instructionClose);

  setInteractEvents(instructionClose, instructionStart, instructionPress);

}

function instructionStart(){
  this.isDown = true;
}

function instructionPress(){

  if(this.isDown){
    console.log('tell me how!');
    if(instructionsOpen){
      TweenLite.to(gameCanvas, 0.3, {y: -windowHeight, ease: Quad.easeInOut});
      TweenLite.to(instructionGraphic, 0.3, {y: windowHeight * 2, ease: Quad.easeInOut});
      instructionsOpen = false;
    } else {
      TweenLite.to(gameCanvas, 0.3, {y: -windowHeight * 1.8, ease: Quad.easeInOut});
      TweenLite.to(instructionGraphic, 0.3, {y: windowHeight * 1.3, ease: Quad.easeInOut});
      instructionsOpen = true;
    }

    this.isDown = false;
  }

}


//////////////////////////////////////////////////////////////////// !HISCORE

function makeHiScore(){
  var hiScoreLabel = new Text('HI-SCORE:', hiScoreLabelStyle);
  hiScoreLabel.position.x = windowWidthHalf - hiScoreLabel.width / 2;
  hiScoreLabel.position.y = 315 * sf;
  menuContainer.addChild(hiScoreLabel);

  hiScoreNumber = new Text(
    hiScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), hiScoreNumberStyle);
  hiScoreNumber.position.x = windowWidthHalf - hiScoreNumber.width / 2;
  hiScoreNumber.position.y = 336 * sf;
  menuContainer.addChild(hiScoreNumber);

  resetScoreButton = new g;
  resetScoreButton.beginFill(0x00ff00);
  resetScoreButton.drawRect(0,0,hiScoreNumber.width,
    hiScoreNumber.height + hiScoreLabel.height);
  resetScoreButton.position.set(
    windowWidthHalf - resetScoreButton.width / 2,
    315 * sf
  );
  resetScoreButton.alpha = 0;
  resetScoreButton.interactive = true;
  menuContainer.addChild(resetScoreButton);
  //setInteractEvents(element, start, end, move)
  setInteractEvents(resetScoreButton, resetHiScoreStart, resetHiScore);
}

function resetHiScoreStart(){
  this.isDown = true;
}

function resetHiScore(){
  if(this.isDown){
    if(resetTapCount < RESET_TAP_LIMIT){
      resetTapCount++;

    } else {
      putHiScore(0);
      updateResetHiScoreSize();
      resetTapCount = 0;
    }

    console.log('tapped: ' + resetTapCount);
    console.log('hiScore: ' + hiScore);

    this.isDown = false;
  }
}

function updateResetHiScoreSize(){
  resetScoreButton.width = hiScoreNumber.width;
  resetScoreButton.x = windowWidthHalf - hiScoreNumber.width / 2;
}

//////////////////////////////////////////////////////////////////// !GAMEOVER

function gameOver(){
  state = pause;
  isPaused = true;
  isGameOver = true;

  if(checkHiScore()){
    putHiScore(score);
    updateResetHiScoreSize();
    changeMenuState('hiScore');
  } else {
    changeMenuState('gameOver');
  }

  TweenLite.to(gameCanvas, 0.3, {y: -windowHeight, ease: Quad.easeInOut});

}

//////////////////////////////////////////////////////////////////// !STATES

function play(){
  timerCountDown();
  timeUpdate();
}

function pause(){

}

//////////////////////////////////////////////////////////////////// !LOOP

function gameLoop(){
  time.update();

  state();

  renderer.render(stage);
  requestAnimationFrame(gameLoop);
}

//////////////////////////////////////////////////////////////////// !TIMER

function timeUpdate(){
  elapsedTime += time.elapsedMS;
}

function timerCountDown(){

  var timerProgress = (nextTimerEnd - elapsedTime) / timerLength;
  // console.log('progress: ' + timerProgress);


  // timerIndicator.scaleX = rangeMapper(timerProgress, 0, 1, 0, 1);
  timerIndicator.width = rangeMapper(timerProgress, 0, 1, 0, gridSize);

  if(elapsedTime > nextTimerEnd){
    //timer is done,
    outOfTime();
  }
}

function checkTimerLength(){
  timerMult = Math.floor(totalCleared / NUM_PER_LEVEL) + 1;
  console.log('mult: ' + timerMult);
}

function resetTimer(){
  timerIndicator.scaleX = 1;

  timerLength = (TIMER_START_LENGTH - (TIMER_INCREMENT * timerMult)) * 1000;

  nextTimerEnd = elapsedTime + timerLength;

  resetTouch();
}

function outOfTime(){
  timerEnd = true;

  dropPiece();

  timerEnd = false;
}

//////////////////////////////////////////////////////////////////// !PAUSE

function pressPause(){
  if(this.isDown){
    if(state == play){
      pauseGame();
    } else {
      resumeGame();
    }
    this.hideTop();

    this.isDown = false;
  }

}

function pauseGame(){
  state = pause;
  isPaused = true;
  changeMenuState('pause');
  TweenLite.to(gameCanvas, 0.3, {y: -windowHeight, ease: Quad.easeInOut});
}

function pauseOnEvent(){
  if(isGameOver){
    //it was gameover when unlocking, change state to logo
    changeMenuState('logo');
  } else {
    //game was in progress, pause the action
    state = pause;
    isPaused = true;
    changeMenuState('pause');
    gameCanvas.y = -windowHeight;
  }
}

function resumeGame(){
  if(this.isDown){
    state = play;
    isPaused = false;
    resetTapCount = 0;
    resetTimer();
    TweenLite.to(gameCanvas, 0.3, {y: 0, ease: Quad.easeInOut});

    this.hideTop();

    this.isDown = false;
  }

}

//////////////////////////////////////////////////////////////////// !RESET

function resetGame(){
  totalCleared = 0;
  score = 0;
  resetTapCount = 0;
  resetGrid();
  updateGridBlocks();
  checkTimerLength();
  resetTimer();
  newLivePiece(getBrickFromBag());
  resetSwap();
  updateLevel();
  updateScore();
}

function resetGrid(){
  for(var y = 0; y < GRID_SEGMENTS; y++){
    for(var x = 0; x < GRID_SEGMENTS; x++){
      gridMatrix[y][x] = 0;
    }
  }
}



//////////////////////////////////////////////////////////////////// !TOUCH

function onTouchStart(event){
  this.data = event.data;
  touching = true;
  touchInit = this.data.getLocalPosition(this.parent);
  // touchDiff = touchInit;

  posInit = {
    x: liveBricksContainer.getChildAt(0).x,
    y: liveBricksContainer.getChildAt(0).y
  }
  // console.log('onTouchStart pos init: ' + posInit.x + '  ' + posInit.y);
}

function onTouchMove(){
  touchNew = this.data.getLocalPosition(this.parent);
  touchChangeX = (touchNew.x - touchInit.x) * TOUCH_MULTIPLIER;
  touchChangeY = (touchNew.y - touchInit.y) * TOUCH_MULTIPLIER;

  var newPos = quantizeMovement(touchChangeX + posInit.x, touchChangeY + posInit.y);

  var curPos = {
    x: getGridCoordinate(livePiece.x),
    y: getGridCoordinate(livePiece.y)
  }

  if(!isPaused){
    if(newPos.x != curPos.x || newPos.y != curPos.y){
      // console.log('curX: ' + curPos.x + ' curY: ' + curPos.y + 'newX: '
      // + newPos.x + ' newY: ' + newPos.y);

      //find the difference between positions
      var diffX = newPos.x - curPos.x;
      var diffY = newPos.y - curPos.y;
      //get the unit we need to check by, it can be positive or negative
      var unitX = diffX / Math.abs(diffX);
      var unitY = diffY / Math.abs(diffY);

      // console.log('diffX: ' + diffX + '  unitX: ' + unitX);

      for(var x = 1; x <= Math.abs(diffX); x++){
        //check to see if adding a unit will cause a collision, if not, move the piece

        var tempPos = {
          x: curPos.x + unitX,
          y: curPos.y
        }
        if(!checkCollide(liveMatrix, tempPos, 'x')){
          livePiece.x = (curPos.x + unitX) * brickDim;
        }
      }

      for(var y = 1; y <= Math.abs(diffY); y++){
        //check to see if adding a unit will cause a collision, if not, move the piece

        var tempPos = {
          x: curPos.x,
          y: curPos.y + unitY
        }
        if(!checkCollide(liveMatrix, tempPos , 'y')){
          livePiece.y = (curPos.y + unitY) * brickDim;
        }
      }
    }
  }

  var nextClearX = brickPos(2);
  var nextClearY = brickPos(GRID_SEGMENTS - 5);
  if(livePiece.x > nextClearX || livePiece.y < nextClearY){
    TweenLite.to(nextContainer, 1, {alpha: 1});
  }



}

function onTouchEnd(){
  // getLivePosition();
  axisLockX = false;
  axisLockY = false;
  this.data = null;

  dropEnabled = true;
}

function resetTouch(){
  touchInit = touchNew;
  // touchInit.x = touchNew.x;
  // touchInit.y = touchNew.y;
}

//only limits the movement in the grid boundaries
function quantizeMovement(x, y){

  //return quantized point
  return {
    x: getGridCoordinate(x),
    y: getGridCoordinate(y)
  }

  // return clampedPoint;
}

function moveOneUnit(){

}

function checkCollide(matrix, newPos, axis){

  var checkPosition = {x,y}

  switch(axis){
    case 'x':
      checkPosition.x = newPos.x;
      checkPosition.y = getGridCoordinate(livePiece.y);
      break;

    case 'y':
      checkPosition.x = getGridCoordinate(livePiece.x);
      checkPosition.y = newPos.y;
      break;

    case undefined:
      checkPosition.x = newPos.x;
      checkPosition.y = newPos.y;
      break;
  }

  for(var y = 0; y < matrix.length; y++){
    for (var x = 0; x < matrix[y].length; x++){
      var outBoundsX = false, outBoundsY = false;

      if(checkPosition.x + x < 0 || checkPosition.x + x > gridMatrix[y].length - 1){
        outBoundsX = true;
      }

      if(checkPosition.y + y < 0 || checkPosition.y + y > gridMatrix.length - 1){
        outBoundsY = true;
      }

      // console.log('quick check : ' + outBoundsY + ' ' + outBoundsX);
      //
      // console.log('x: ' + checkPosition.x + ' y: ' + checkPosition.y);

      if(matrix[y][x] == 1){

        if(outBoundsX || outBoundsY){
          return true;
        }

        var collideState = gridMatrix[checkPosition.y + y][checkPosition.x + x];

        if(collideState == 1){
          return true;
        }
      }
    }
  }
  // console.log('no collision');
  return false;
}

function getGridCoordinate(param){
  return Math.round(param / brickDim);
}

function checkSlop(axis, pos, init){
  var changeX = Math.abs(pos.x - init.x);
  var changeY = init.y - pos.y;

  if (changeX > TOUCH_SLOP || changeY < -TOUCH_SLOP){
    if(changeX > changeY && !unlocking){
      movingCid = true;
    } else {
      if (!movingCid){
        unlocking = true;
      }
    }
  }
}

function buttonStart(){
  console.log('button start');
  // this.x += 20;
  this.hideTop();
  this.isDown = true;
  // tappingButton = true;
}

function tapRotateLeft(){
  if(this.isDown){

    rotatePiece('left');

    tappingButton = false;

    this.hideTop();
    this.isDown = false;
  }
}

function tapRotateRight(){
  if(this.isDown){
    rotatePiece('right');

    // wallKick('right');
    tappingButton = false;

    this.hideTop();
    this.isDown = false;
  }
}

function rotatePiece(direction){
  var matrix = rotateData(direction);

  var pos = getLivePosition();
  // console.log('x: ' + pos.x + ' y: ' + pos.y);

  if(!checkCollide(matrix, pos)){
    // rotatePiece(matrix, 'left');
    liveMatrix = matrix;
    updateLivePiece();
  } else {
    pos = wallKick(pos, matrix, direction);
    // console.log('x: ' + pos.x + ' y: ' + pos.y);
    if(!pos){
      // console.log('pos: ' + pos);
      //do nothing could not wall kick
      console.log('cant kick it');
    } else {
      // console.log('pos: ' + pos);
      if(!checkCollide(matrix, pos)){
        console.log('yes you can!');

        liveMatrix = matrix;
        // rotatePiece(matrix, 'left');
        updateLivePiece();
        livePiece.position.set(pos.x * brickDim, pos.y * brickDim);
      }

      // console.log('x: ' + pos.x + ' y: ' + pos.y);
    }
  }
}

//////////////////////////////////////////////////////////////////// !ROTATION

function rotateData(dir){
  var size = liveMatrix.length;
  var rot90 = new Array(size);

  printMatrix(liveMatrix);

  for(var i = 0; i < size; i++){
    rot90[i] = new Array(size);
    for(var j = 0; j < size; j++){
      switch (dir){
        case 'left':
          rot90[i][j] = liveMatrix[j][size - i - 1];
          break;
        case 'right':
          rot90[i][j] = liveMatrix[size - j - 1][i];
          break;
      }
    }
  }

  printMatrix(rot90);

  return rot90;
}

function wallKick(pos, matrix, dir){
  console.log('can i kick it?');
  //check edges first, then check corners
  var dataOffset = getLivePosition();

  var size = liveMatrix[0].length;

  var gm = gridMatrix;

  //check Y out of bounds first
  if(dataOffset.y < 0){
    //potentially out of bounds
    for(var x = 0; x < size; x++){

      // off the top, bump down
      if(matrix[0][x] == 1){
        console.log('need to kick');
        pos.y += 1 * Math.abs(dataOffset.y);
        return pos;
      }
    }
  }

  if(dataOffset.y + size > gm.length){
    //potentially out of bounds
    for(var x = 0; x < size; x++){
      //off the bottom, bump up
      if(matrix[size - 1][x] == 1){
        console.log('need to kick');
        pos.y -= 1 * ((dataOffset.y + size) - gm.length);
        return pos;
      }
    }
  }

  //check X out of bounds second
  if(dataOffset.x < 0){
    //potentially out of bounds
    for(var y = 0; y < size; y++){

      // off the top, bump down
      if(matrix[y][0] == 1){
        console.log('need to kick');
        pos.x += 1 * Math.abs(dataOffset.x);
        return pos;
      }
    }
  }

  if(dataOffset.x + size > gm.length){
    //potentially out of bounds
    for(var y = 0; y < size; y++){
      //off the bottom, bump up
      if(matrix[y][size - 1] == 1){
        console.log('need to kick');
        pos.x -= 1 * ((dataOffset.x + size) - gm.length);
        return pos;
      }
    }
  }

  //check edges colliding
  for(var x = 1; x < size - 1; x++){
    if(matrix[0][x] == 1 && gm[dataOffset.y][dataOffset.x + x] == 1){

      console.log('checking here');
      pos.y++;
      return pos;
    }

    if(matrix[size - 1][x] == 1 && gm[dataOffset.y + size - 1][dataOffset.x + x] == 1){
      pos.y--;
      return pos;
    }
  }

  for(var y = 1; y < size - 1; y++){

    if(matrix[y][0] == 1 && gm[dataOffset.y + y][dataOffset.x] == 1){
      pos.x++;
      return pos;
    }

    if(matrix[y][size - 1] == 1 && gm[dataOffset.y + y][dataOffset.x + size - 1] == 1){
      pos.x--;
      return pos;
    }
  }

  //check upper left corner
  if(matrix[0][0] == 1 && gm[dataOffset.y][dataOffset.x] == 1){
    switch(dir){
      case 'right':
        pos.y++;
        break;
      case 'left':
        pos.x++;
        break;
    }
    return pos;
  }

  //check upper right corner
  if(matrix[0][size - 1] == 1 && gm[dataOffset.y][dataOffset.x + size - 1] == 1){
    switch(dir){
      case 'right':
        pos.x--;
        break;
      case 'left':
        pos.y++;
        break;
    }
    return pos;
  }
  //check lower left corner
  if(matrix[size - 1][0] == 1 && gm[dataOffset.y + size - 1][dataOffset.x] == 1){
    switch(dir){
      case 'right':
        pos.x++;
        break;
      case 'left':
        pos.y--;
        break;
    }
    return pos;
  }
  //check lower right corner
  if(matrix[size - 1][size - 1] == 1 && gm[dataOffset.y + size - 1][dataOffset.x + size - 1] == 1){
    switch(dir){
      case 'right':
        pos.y--;
        break;
      case 'left':
        pos.x--;
        break;
    }
    return pos;
  }

  return false;
}

//////////////////////////////////////////////////////////////////// !POSITION

function getLivePosition(){
  var unitPos = {
    x: getGridCoordinate(livePiece.x),
    y: getGridCoordinate(livePiece.y)
  }

  console.log('live pos: ' + unitPos.x + '  ' + unitPos.y);

  return unitPos;
}

function setLivePosition(pos){
  var fullPosition = {
    x: pos.x * brickDim,
    y: pos.y * brickDim
  }

  return fullPosition;
}

function setUnitPosition(x, y){

}

//////////////////////////////////////////////////////////////////// !DROP



function dropPiece(){
  TweenLite.killTweensOf(timerIndicator);

  applyDataToGrid();

  scanMatrixForSquare();

  checkForChain();

  updateGridBlocks();

  removeSquares();

  newLivePiece(nextMatrix);

  newNextPiece(getBrickFromBag());

  printMatrix(gridMatrix);

  checkTimerLength();

  updateLevel();

  updateScore();

  resetTimer();

  swapOnTurn = false;

  dropEnabled = false;
}

function checkValidDrop(){
  var unitPos = {
    x: 0,
    y: GRID_SEGMENTS - 3
  }

  if(checkCollide(liveMatrix, unitPos)){
    console.log('piece was going to collide, resetting');
    resetGame();
  }
}

function applyDataToGrid(){
  var dataOffset = getLivePosition();

  var size = liveMatrix[0].length;

  for(var i = 0; i < size; i++){
    for (var j = 0; j < size; j++){
      if(liveMatrix[i][j] == 1){

        var block = gridBlocks[i + dataOffset.y][j + dataOffset.x];
        TweenLite.killTweensOf(block);


        // gridBlocks[i + dataOffset.y][j + dataOffset.x].tween.kill();
        gridMatrix[i + dataOffset.y][j + dataOffset.x] = liveMatrix[i][j];
        // placeBrickOnGrid(j + dataOffset.x, i + dataOffset.y);
      }
    }
  }
}

function findNewPiece(){
  var random = Math.floor(Math.random() * BRICK_TYPES.length);

  console.log('random num: ' + random);

  return BRICK_TYPES[random];
}

function scanMatrixForSquare(){
  console.log('scanning');
  for(var y = 0; y < gridMatrix.length - MINIMUM_SQUARE_SIZE + 1; y++){
    for(var x = 0; x < gridMatrix[y].length - MINIMUM_SQUARE_SIZE + 1; x++){
      if(gridMatrix[y][x] == 1){
        //check for a square
        console.log('need to check for square');
        checkForSquare(y, x);
      }
    }
  }
}

function checkForSquare(y, x){
  var checkSquareSize = MINIMUM_SQUARE_SIZE;
  // var rangeStorage;

  for(var yy = 0; yy < checkSquareSize; yy++){
    for(var xx = 0; xx < checkSquareSize; xx++){
      if(gridMatrix[y + yy][x + xx] == 0){
        //it is not a square do something else
        // console.log('not a full square');
        return;
      }
    }
  }

  console.log('made it through loop, square?')

  for(var yy = 0; yy < checkSquareSize; yy++){
    for(var xx = 0; xx < checkSquareSize; xx++){
      console.log('dropping in array: ' + y + yy + ' ' + x + xx);
      blocksToRemove.push([y + yy, x + xx]);
    }
  }
}

function checkForChain(){
  if(blocksToRemove.length > 0){
    if(!chain){
      console.log('starting new chain: x' + multiplier);
      chain = true;
      multiplier = 1;
    } else {
      console.log('chain unbroken! x' + multiplier);
      multiplier++;
    }
  } else {
    console.log('chain broken!');
    chain = false;
  }
}

function comparator(a, b){
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  if (a[1] < b[1]) return -1;
  if (a[1] > b[1]) return 1;
  return 0;
}

function pruneArrayForDupes(array){

  for(var i = 0; i < array.length; i++){

    if(i + 1 == array.length){
      console.log('end of array, bailing out');
      return;
    }

    while(array[i][0] == array[i + 1][0] && array[i][1] == array[i + 1][1]){
      array.splice(i + 1, 1);
    }
  }
}

function removeSquares(){

  var numBlocks = 0;
  var blockMult = 1;
  var cumulativeScore = 0;
  if(blocksToRemove.length > 0){

    console.log('removing blocks');
    printMatrix(blocksToRemove);
    console.log('');
    blocksToRemove.sort(comparator);
    printMatrix(blocksToRemove);
    console.log('');
    pruneArrayForDupes(blocksToRemove);
    printMatrix(blocksToRemove);

    for(var i = 0; i < blocksToRemove.length; i++){

      if(gridMatrix[blocksToRemove[i][0]][blocksToRemove[i][1]] == 1){
        console.log('blocks: ' + blocksToRemove[i]);

        console.log('matrix: ' + gridMatrix[blocksToRemove[i][0]][blocksToRemove[i][1]]);
        //we have a square, need to remove
        gridMatrix[blocksToRemove[i][0]][blocksToRemove[i][1]] = 0;
        numBlocks++;
        var block = gridBlocks[blocksToRemove[i][0]][blocksToRemove[i][1]];
        // var block = gridBlocks[blocksToRemove[i][0]][blocksToRemove[i][1]];
        block.tween = TweenLite.to(block,
          BLOCK_ANIM_OUT_SPEED, {scaleX: 1.2, scaleY: 1.2, alpha: 0,
            delay: BLOCK_ANIM_DELAY * i, ease: Strong.easeIn});

        cumulativeScore += POINTS_PER_BLOCK * blockMult;

        console.log(blockMult + ' blocks: ' + cumulativeScore);

        blockMult++;

      }
    }

    cumulativeScore *= multiplier;

    sendScorePopup(getCenterPointCleared(), cumulativeScore);
  }

  score += cumulativeScore;

  totalCleared += numBlocks;

  console.log('number cleared: ' + totalCleared);

  //clear the array
  blocksToRemove = [];
}

function getCenterPointCleared(){
  var minY = blocksToRemove[0][0];
  var maxY = blocksToRemove[blocksToRemove.length - 1][0];

  var minX = blocksToRemove.length;
  var maxX = 0;

  for(var i = 0; i < blocksToRemove.length; i++){
    if(blocksToRemove[i][1] < minX){
      minX = blocksToRemove[i][1];
    }
    if(blocksToRemove[i][1] > maxX){
      maxX = blocksToRemove[i][1];
    }
  }

  maxY++;
  maxX++;

  console.log('minX: ' + minX + ' maxX: ' + maxX + ' minY: ' + minY + ' maxY: ' + maxY);

  var centerPoint = {
    x: brickPos(((maxX - minX) / 2) + minX) + gridContainer.x,
    y: brickPos(((maxY - minY) / 2) + minY) + gridContainer.y
  }

  console.log('centerPoint: ' + centerPoint.x + ' ' + centerPoint.y);

  return centerPoint;
}

//////////////////////////////////////////////////////////////////// SCORE POPUP

function sendScorePopup(pos, score){

  var popup = getPopup();

  popup.alpha = 1.0;

  // var newPoints = 10 * multiplier;
  popup.text = 'x' + multiplier + '\n' + score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  popup.position.set(pos.x, pos.y);

  popup.anim = TweenLite.to(popup, POPUP_VISIBLE_TIME,
    {x: pos.x, y: pos.y - (60 * sf), alpha:0, ease: Strong.easeOut});
  popup.animating = true;

  popup.anim.onComplete = () =>
    popup.animating = false;
}

function getPopup(){
  if(scorePopupContainer.children.length == 0){
    createPopup();
  }

  for(var i = 0; i < scorePopupContainer.children.length; i++){
    var popup = scorePopupContainer.children[i];
    if(!popup.animating){
      return popup;
    }

    if(i == scorePopupContainer.children.length - 1){
      //we are out of popups, create a new one
      createPopup();
    }
  }
}

function createPopup(){
  // console.log('creating popup');

  var popup = new Text('', scorePopupStyle);
  popup.animating = false;
  popup.anchor.set(0.5, 0.5);

  scorePopupContainer.addChild(popup);
}

//////////////////////////////////////////////////////////////////// !UNLOCKING

function unlockDevice(){
  checkHiScore();
  if(isMobile){
    ACTIONS.unlock();
  }
}

//////////////////////////////////////////////////////////////////// !SCORE

function getHiScore(){
  var hs;
  if(isMobile){
    hs = SETTINGS.getNumber('sqrd_score', 0);

  } else {
    hs = parseInt(getCookie('sqrd_score'), 10);
  }
  return hs;
}

function putHiScore(newHiScore){
  if(isMobile){
    SETTINGS.putNumber('sqrd_score', newHiScore);
  } else {
    setCookie('sqrd_score', '' + newHiScore, 4);
  }

  hiScore = newHiScore;

  scoreLabel.text = 'HI-SCORE: ' +
    hiScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  hiScoreNumber.text = hiScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  hiScoreNumber.position.x = windowWidthHalf - hiScoreNumber.width / 2;
}

function getCookie(cookieName){
  var name = cookieName + '=';
  var cookieArray = document.cookie.split(';');
  for(var i = 0; i < cookieArray.length; i++){
    // console.log('looping through cookie');
    var cookie = cookieArray[i];
    while(cookie.charAt(0) == ' ') cookie = cookie.substring(1);
    if(cookie.indexOf(name) == 0) return cookie.substring(name.length, cookie.length);

  }
  return '0';
}

function setCookie(cName, cValue, exDays){
  var d = new Date();
  d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cName + '=' + cValue + '; ' + expires;
  // console.log('setCookie:' + document.cookie);
}

function checkHiScore(){
  if(score > hiScore){
    return true;
  }
}

//////////////////////////////////////////////////////////////////// !UTILITIES

function printMatrix(matrix){
  for(var i = 0; i < matrix.length; i++){
    var iter = i;
    if(i < 10){
      iter = ' ' + i;
    }
    var row = 'row ' + iter + ': ';
    for (var t = 0; t < matrix[i].length; t++){
      row += matrix[i][t] + ' ';
    }
    console.log(row);
  }
}

function getRadians(degrees){
  return degrees * Math.PI /180;
}

function getScaleFactor(){
  //original design was created with a 360x640 resolution so we divide by
  //640 to get an adjusted unit size
  var scale = windowHeight / 640;
  return scale;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function createSprite(path){
  // console.log('creating sprite: resources path: '
  // + resources[path] + '   texture: ' + resources[path].texture);
  return new Sprite(
    resources[path].texture
  );
}

function addScaleXYProperties(sprite){
  if (!sprite.scaleX && sprite.scale.x) {
    Object.defineProperty(sprite, "scaleX", {
      get: function get() {
        return sprite.scale.x;
      },
      set: function set(value) {
        sprite.scale.x = value;
      }
    });
  }
  if (!sprite.scaleY && sprite.scale.y) {
    Object.defineProperty(sprite, "scaleY", {
      get: function get() {
        return sprite.scale.y;
      },
      set: function set(value) {
        sprite.scale.y = value;
      }
    });
  }
}

function rangeMapper(source, minSource, maxSource, minTarget, maxTarget, clamp){
  var sourceRange = maxSource - minSource;
  var targetRange = maxTarget - minTarget;

  var value = (source - minSource) * targetRange / sourceRange + minTarget;

  if (clamp){
    if(source >= maxSource){
      value = maxTarget;
    }

    if(source <= minSource){
      value = minTarget;
    }
  }

  return value;
}

function setDelay(func, delay){
  if(delay == undefined){
    delay = 1000;
  }
  setTimeout(function(){func();}, delay);
}

function makeBlock(width, height, padding, radius, color, shadowHeight, shadowColor){
  var block = new Container();
  block.width = width;
  block.height = height;

  var blockPaddedWidth = width - padding * 2;
  var blockPaddedHeight = height - padding * 2;

  if(shadowColor == undefined){
    var blockBase = new g;
    blockBase.beginFill(color);
    blockBase.drawRoundedRect(padding, padding,
      blockPaddedWidth, blockPaddedHeight, radius);
    block.addChild(blockBase);


  } else {
    var blockBase = new g;
    blockBase.beginFill(shadowColor);
    blockBase.drawRoundedRect(padding, padding,
      blockPaddedWidth, blockPaddedHeight, radius);
    block.addChild(blockBase);

    var blockTop = new g;
    blockTop.beginFill(color);
    blockTop.drawRoundedRect(padding, padding,
      blockPaddedWidth, blockPaddedHeight - shadowHeight, radius);
    block.addChild(blockTop);

    block.pressed = false;
    block.hideTop = () => {
      if(!block.pressed){
        blockTop.alpha = 0;
        block.pressed = true;
      } else {
        blockTop.alpha = 1;
        block.pressed = false;
      }
    }
  }

  block.isDown = false;

  return block;
}

function makeMask(width, height, padding, radius, color){

  var maskPaddedWidth = width - padding * 2;
  var maskPaddedHeight = height - padding * 2;

  var mask = new g;
  mask.beginFill(color);
  mask.drawRoundedRect(padding, padding,
    maskPaddedWidth, maskPaddedHeight, radius);

  return mask;
}

function setInteractEvents(element, start, end, move){
  element.interactive = true;

  element
    .on('mousedown', start)
    .on('touchstart',start)

    .on('touchend', end)
    .on('mouseup', end);

  if(move != undefined){
    element
      .on('mousemove', move)
      .on('touchmove', move)
      .on('touchendoutside', end)
      .on('mouseupoutside', end);
  } else {
    element
      .on('touchendoutside', cancelButton)
      .on('mouseupoutside', cancelButton)
  }
}

function cancelButton(){
  if(this.pressed){
    this.hideTop();
  }
}

function scaleConstants(){
  TOUCH_SLOP *= sf;
  TOP_BAR_HEIGHT *= sf;
  BOTTOM_BAR_HEIGHT *= sf;
  STD_PADDING *= sf;
  TIMER_HEIGHT *= sf;
  BOTTOM_BUTTON_HEIGHT *= sf;
  NAVBAR_PAD *= sf;
  BUTTON_RADIUS *= sf;
  STATUSBAR_PAD *= sf;
  BLOCK_RADIUS *= sf;
  BLOCK_PADDING *= sf;
  BLOCK_SHADOW_HEIGHT_SMALL *= sf;
  BLOCK_SHADOW_HEIGHT_LARGE *= sf;
  SUBHEAD_OFFSET *= sf;
  SWAP_BLOCK_SIZE *= sf;
  SWAP_BLOCK_RADIUS *= sf;
  SWAP_BLOCK_PADDING *= sf;
  LOGO_SIZE *= sf;
  LOGO_TOP_PADDING *= sf;
  MENU_BUTTON_WIDTH *= sf;
  MENU_BUTTON_HEIGHT *= sf;
  MENU_BUTTON_TOP_PADDING *= sf;
}
