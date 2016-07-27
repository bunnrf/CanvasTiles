/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const GameView = __webpack_require__(3);
	
	document.addEventListener("DOMContentLoaded", function(){
	  // ES6, not universally supported
	  // [tileCanvas, bkgdCanvas = document.getElementsByTagName("canvas");
	
	  document.getElementById("slider").onchange = function(  ) {
	    document.getElementById("sliderVal").textContent = this.value;
	  };
	
	  const bkgdCanvas = document.getElementsByClassName("background")[0];
	  const tileCanvas = document.getElementsByClassName("tiles")[0];
	
	  const bkgdCtx = bkgdCanvas.getContext("2d");
	  const tileCtx = tileCanvas.getContext("2d");
	
	  tileCtx.font = "bold 48px Arial";
	  tileCtx.textBaseline = "middle";
	  tileCtx.textAlign = "center";
	
	  const buttons = document.getElementsByTagName("button")
	  for (let i = 0; i < buttons.length; i++) {
	    buttons[i].textContent = Game.GAME_TYPES[i];
	    buttons[i].onclick = function() {
	      const size = document.getElementsByTagName("input")[0].value;
	      game.newGame(size - 0, Game.GAME_TYPES[i], bkgdCtx);
	      gameView.animate();
	    }
	  }
	
	  const game = new Game(bkgdCtx);
	  const gameView = new GameView(game, tileCtx)
	  gameView.start();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Board = __webpack_require__(2);
	
	function resizeCanvas(width, height) {
	  const bkgdCanvas = document.getElementsByClassName("background")[0];
	  const tileCanvas = document.getElementsByClassName("tiles")[0];
	
	  // canvas container doesn't automatically resize
	  document.getElementsByClassName("board").item(0).style.height = height;
	
	  bkgdCanvas.width = width;
	  bkgdCanvas.height = height;
	
	  tileCanvas.width = width;
	  tileCanvas.height = height;
	
	  // .width resets these properties
	  const tileCtx = tileCanvas.getContext("2d");
	  tileCtx.font = "bold 48px Arial";
	  tileCtx.textBaseline = "middle";
	  tileCtx.textAlign = "center";
	}
	
	const Game = function(bkgd) {
	  this.newGame(4, "CLASSIC", bkgd);
	};
	
	Game.GAME_TYPES = ["CLASSIC", "PRIMES"];
	
	Game.prototype.newGame = function (size, gameType, bkgd) {
	  if (size > 6) {
	    resizeCanvas(600, 600);
	  } else {
	    resizeCanvas(size * 100, size * 100);
	  }
	
	  this.board = new Board(size, gameType, this.addScore.bind(this));
	  this.board.drawBkgd(bkgd);
	
	  this.score = 0;
	  this.over = false;
	  this.initialTiles(Math.floor(Math.sqrt(size)));
	};
	
	Game.prototype.initialTiles = function (count) {
	  for (let i = 0; i < count; i++) {
	    this.board.setRandomTile();
	  }
	};
	
	Game.prototype.moveTiles = function (delta) {
	  if (this.over) { return }
	
	  this.board.snapTiles();
	  this.board.clearTempTiles();
	
	  const moved = this.board.moveTiles(delta);
	
	  if (moved) {
	    for (let i = 0; i < Math.floor(this.board.size / 4); i++) {
	      this.board.setRandomTile();
	    }
	  }
	
	  // this.board.mergeTiles();
	
	  if (!this.board.movePossible()) {
	    this.over = true;
	    setTimeout(() => {
	      alert("No moves possible. Game over.");
	    }, 2000)
	  }
	
	  return moved;
	};
	
	Game.prototype.addScore = function (amount) {
	  this.score += amount;
	};
	
	Game.prototype.draw = function (ctx) {
	  this.board.updateTiles();
	  this.board.draw(ctx);
	};
	
	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Tile = __webpack_require__(4);
	
	const Board = function (size, type, scoreCallback) {
	  this.size = size;
	  this.type = type;
	  this.tiles = [];
	  this.tempTiles = [];
	  this.stepSize = Math.floor(size / 4) / 2;
	  this.scoreCallback = scoreCallback;
	
	  if (size > 6) {
	    this.dim_x = 600;
	    this.dim_y = 600;
	    this.margin = Math.floor(100 / (size + 1));
	    this.tileDim_x = (600 - ((size + 1) * this.margin)) / size;
	    this.tileDim_y = (600 - ((size + 1) * this.margin)) / size;
	  } else {
	    this.dim_x = size * 100;
	    this.dim_y = size * 100;
	    this.margin = 16;
	    this.tileDim_x = (this.dim_x - ((size + 1) * 16)) / size;
	    this.tileDim_y = (this.dim_y - ((size + 1) * 16)) / size;
	  }
	};
	
	Board.SEEDS = { "CLASSIC": [2, 4],
	                 "PRIMES": [2, 3] };
	
	Board.prototype.emptyGrid = function () {
	  const grid = [];
	  let row = [];
	
	  for (let i = 0; i < this.size; i++) {
	   row = [];
	   for (let j = 0; j < this.size; j++) {
	     row.push(null);
	   }
	   grid.push(row);
	  }
	
	  return grid;
	};
	
	Board.prototype.drawBkgd = function (bkgd) {
	  bkgd.clearRect(0, 0, this.dim_x, this.dim_y);
	  bkgd.fillStyle = "rgba(238, 228, 218, .35)";
	
	  for (let i = 0; i < this.size; i++) {
	    for (let j = 0; j < this.size; j++) {
	      bkgd.fillRect((i + 1) * this.margin + i * this.tileDim_x,
	                    (j + 1) * this.margin + j * this.tileDim_y,
	                    this.tileDim_x, this.tileDim_y);
	    }
	  }
	};
	
	Board.prototype.debugSetup = function () {
	  let pos;
	  for (let i = this.size * this.size - this.size; i > 0; i--) {
	    this.setRandomTile();
	  }
	};
	
	Board.prototype.removeTile = function (tile) {
	  this.tiles.splice(this.tiles.indexOf(tile), 1);
	};
	
	Board.prototype.getTile = function (pos) {
	  return this.tiles.find((tile) => { return (tile.pos[0] === pos[0] && tile.pos[1] === pos[1]) } );
	};
	
	Board.prototype.setTile = function (tile) {
	  this.tiles.push(tile);
	};
	
	Board.prototype.mergeTile = function (tile) {
	  this.scoreCallback(tile.merge(this.nextValue.bind(this)));
	};
	
	// for merging
	// remove tile from tiles array
	// add tile to temporary tiles
	Board.prototype.pseudify = function (tile) {
	  this.removeTile(tile);
	  this.tempTiles.push(tile);
	};
	
	Board.prototype.allTiles = function () {
	  return this.tiles;
	};
	
	Board.prototype.updateTiles = function () {
	  this.tempTiles.concat(this.tiles).forEach((tile) => {
	    tile.step(this.stepSize)
	  });
	};
	
	// snap tiles to target
	Board.prototype.snapTiles = function () {
	  this.tiles.forEach((tile) => {
	    tile.snap();
	  })
	};
	
	Board.prototype.clearTempTiles = function () {
	  this.tempTiles = [];
	};
	
	Board.prototype.moveTiles = function (direction) {
	  let col;
	  let firstMovablePos;
	  let newPos = [0, 0];
	  let moved = false;
	
	  if (this.tiles.length > 255) {
	    debugger
	  }
	
	  // create a grid to help ensure we iterate over the tiles in the correct order
	  const grid = this.emptyGrid();
	  this.tiles.forEach((tile) => {
	    grid[tile.pos[0]][tile.pos[1]] = tile;
	  });
	
	  if (direction[0] === 1) {
	    grid.reverse();
	  }
	
	  grid.forEach((column) => {
	    col = column.slice();
	    if (direction[1] === 1) {
	      col.reverse();
	    }
	
	    col.forEach((tile) => {
	      if (!tile) { return; }
	      tile.merged = false;
	      firstMovablePos = this.firstMovablePos(tile.pos, direction);
	
	      if (firstMovablePos[0] !== tile.pos[0] || firstMovablePos[1] !== tile.pos[1]) {
	        moved = true;
	        this.moveTile(tile.pos, firstMovablePos);
	      }
	    });
	  });
	
	  return moved;
	};
	
	// return position of nearest free space or mergable tile
	Board.prototype.firstMovablePos = function (pos, direction) {
	  let nextPos = [pos[0] + direction[0], pos[1] + direction[1]];
	  let nextTile;
	
	  while (this.inBounds(nextPos)) {
	    nextTile = this.getTile(nextPos)
	    if (nextTile) {
	      if (Tile.canMerge(this.getTile(nextPos), this.getTile(pos))) {
	        nextPos = [nextPos[0] + direction[0], nextPos[1] + direction[1]];
	        break;
	      } else {
	        break;
	      }
	    }
	    nextPos = [nextPos[0] + direction[0], nextPos[1] + direction[1]];
	  }
	
	  return [nextPos[0] - direction[0], nextPos[1] - direction[1]];
	};
	
	Board.prototype.inBounds = function (pos) {
	  return pos[0] >= 0 && pos[0] < this.size && pos[1] >= 0 && pos[1] < this.size;
	};
	
	Board.prototype.moveTile = function (pos, newPos) {
	  const tile = this.getTile(pos);
	  const existingTile = this.getTile(newPos);
	
	  if (existingTile) {
	    this.mergeTile(existingTile);
	    tile.moveTo(newPos);
	    this.pseudify(tile);
	  } else {
	    this.removeTile(tile);
	    tile.moveTo(newPos);
	    this.setTile(tile);
	  }
	};
	
	Board.prototype.nextValue = function (value) {
	  switch (this.type) {
	    case "PRIMES":
	      return nextPrime(value);
	      break;
	    case "CLASSIC":
	    default:
	      return value * 2;
	  }
	};
	
	Board.prototype.setRandomTile = function () {
	  const pos = this.getRandomAvailablePosition();
	  const tile = new Tile(pos, Board.SEEDS[this.type][Math.random() > .9 ? 1 : 0]);
	  this.setTile(tile);
	};
	
	Board.prototype.getRandomAvailablePosition = function () {
	  const availablePositions = this.availablePositions();
	
	  return availablePositions[Math.floor(Math.random() * availablePositions.length)]
	};
	
	Board.prototype.availablePositions = function () {
	  const positions = [];
	
	  for (let i = 0; i < this.size; i++) {
	    for (let j = 0; j < this.size; j++) {
	      if (this.freeTile([i, j])) {
	        positions.push([i, j]);
	      }
	    }
	  }
	
	  return positions;
	};
	
	Board.prototype.freeTile = function (pos) {
	  return !this.getTile(pos);
	};
	
	Board.prototype.movePossible = function () {
	  let possible = false;
	  for (let i = 0; i < this.size; i++) {
	    for (let j = 0; j < this.size; j++) {
	      if (!this.getTile([i, j])) {
	        // not sure if returning here returns from the function or not
	        // in either case, this acheives the desired effect
	        possible = true;
	        return true;
	      }
	    }
	  }
	
	  if (possible) {
	    return true;
	  }
	
	  this.tiles.forEach((tile) => {
	    if (this.adjacentMergeableTile(tile)) {
	      possible = true;
	      return true;
	    }
	  });
	
	  return possible;
	};
	
	Board.prototype.adjacentMergeableTile = function (tile) {
	  let found = false;
	  [[0, -1], [0, 1], [-1, 0], [1, 0]].map((dir) => {
	    return [tile.pos[0] + dir[0], tile.pos[1] + dir[1]];
	  }).forEach((pos) => {
	    if (this.inBounds(pos) && tile.value === this.getTile(pos).value) {
	      found = true;
	    }
	  })
	
	  return found;
	};
	
	Board.prototype.draw = function (ctx) {
	  const tiles = this.allTiles();
	
	  ctx.clearRect(0, 0, this.dim_x, this.dim_y);
	
	  this.tempTiles.concat(this.tiles).forEach((tile) => {
	    tile.draw(ctx, this.margin, this.tileDim_x, this.tileDim_y);
	  });
	};
	
	function nextPrime(num) {
	  while (!isPrime(++num)) {}
	  return num;
	}
	
	function isPrime(num) {
	  for (let i = 2; i <= Math.sqrt(num); i++) {
	    if (num % i === 0) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = Board;


/***/ },
/* 3 */
/***/ function(module, exports) {

	const GameView = function (game, ctx) {
	  this.ctx = ctx;
	  this.game = game;
	  this.scoreEl = document.getElementsByClassName("score")[0];
	  this.highScoreEl = document.getElementsByClassName("highscore")[0];
	  this.animating = false;
	};
	
	GameView.KEYCODES = {
	  "87": [0, -1], // w
	  "38": [0, -1], // up
	  "65": [-1, 0], // a
	  "37": [-1, 0], // left
	  "83": [0, 1], // s
	  "40": [0, 1], // down
	  "68": [1, 0], // d
	  "39": [1, 0] // right
	};
	
	GameView.prototype.handleArrow = function (event) {
	  if (Object.keys(GameView.KEYCODES).includes(event.keyCode.toString())) {
	    event.preventDefault();
	    if (this.game.moveTiles(GameView.KEYCODES[event.keyCode])) {
	      this.updateScore();
	      this.startTime = performance.now();
	      if (!this.animating) {
	        this.animating = true;
	        requestAnimationFrame(this.animate.bind(this));
	      }
	    }
	  };
	};
	
	GameView.prototype.bindKeyHandlers = function () {
	  window.addEventListener("keydown", this.handleArrow.bind(this) );
	};
	
	GameView.prototype.start = function () {
	  this.bindKeyHandlers();
	  requestAnimationFrame(this.animate.bind(this));
	};
	
	GameView.prototype.animate = function(time) {
	  this.game.draw(this.ctx);
	
	  if (time - this.startTime < 225) {
	    requestAnimationFrame(this.animate.bind(this));
	  } else {
	    this.animating = false;
	  }
	};
	
	GameView.prototype.updateScore = function () {
	  this.scoreEl.textContent = this.game.score;
	  if (this.game.score > this.highScoreEl.textContent) {
	    this.highScoreEl.textContent = this.game.score;
	  }
	};
	
	module.exports = GameView;


/***/ },
/* 4 */
/***/ function(module, exports) {

	function findRGB(value) {
	  let coefficient = 1;
		let rgb = [238, 229, 219];
	
	  if (value > 2048) {
			coefficient = value / 16384;
			rgb = [224 - Math.floor(coefficient * 144), 256, 165 - Math.floor(coefficient * 20)];
		}	else if (value > 64) {
			coefficient = value / 2048;
			rgb = [237, 190 + Math.floor(coefficient * 20), 133 - Math.floor(coefficient * 80)];
		} else if (value > 4) {
			coefficient = Math.pow(value / 64, .5);
			rgb = [246, 224 - Math.floor(coefficient * 130), 189 - Math.floor(coefficient * 130)];
		} else if (value > 2) {
			rgb = [237, 224, 200];
		}
	  return "rgb(" + rgb.join() + ")";
	}
	
	const Tile = function (pos, value) {
	  this.pos = pos;
	  this.drawPos = pos;
		this.value = value;
	};
	
	Tile.prototype.moveTo = function (pos) {
		this.pos = pos;
	};
	
	Tile.prototype.merge = function (nextValue) {
		this.merged = true;
		return this.value = nextValue(this.value);
	};
	
	Tile.prototype.step = function (stepSize) {
	  let x = this.pos[0];
	  let y = this.pos[1];
	
	  let drawX = this.drawPos[0];
	  let drawY = this.drawPos[1];
	
	  if (drawX > x) {
	    if ((drawX -= stepSize) <= x) {
	      drawX = x;
	      this.drawPos = [drawX, drawY];
	      return true;
	    }
	  }
	
	  if (drawY > y) {
	    if ((drawY -= stepSize) <= y) {
	      drawY = y;
	      this.drawPos = [drawX, drawY];
	      return true;
	    }
	  }
	
	  if (drawX < x) {
	    if ((drawX += stepSize) >= x) {
	      drawX = x;
	      this.drawPos = [drawX, drawY];
	      return true;
	    }
	  }
	
	  if (drawY < y) {
	    if ((drawY += stepSize) >= y) {
	      drawY = y;
	      this.drawPos = [drawX, drawY];
	      return true;
	    }
	  }
	
	  this.drawPos = [drawX, drawY];
	  return false;
	};
	
	Tile.prototype.snap = function () {
	  this.drawPos = this.pos;
	};
	
	Tile.prototype.draw = function (ctx, margin, dim_x, dim_y) {
	  const fontSize = 56 - Math.ceil(Math.log(this.value) / Math.log(10)) * 8;
	  const textColor = this.value > 4 ? "#f9f6f2" : "#776e65";
	
		const bgColor = findRGB(this.value);
	
	  const pos_x = (this.drawPos[0] + 1) * margin + this.drawPos[0] * dim_x;
	  const pos_y = (this.drawPos[1] + 1) * margin + this.drawPos[1] * dim_y;
	
		ctx.save();
		ctx.fillStyle = bgColor;
		ctx.translate(pos_x, pos_y);
	  ctx.fillRect(0, 0, dim_x, dim_y);
	  ctx.fillStyle = textColor;
	  ctx.font = "bold " + fontSize + "px Arial";
	  ctx.fillText(this.value.toString(), dim_x / 2, dim_y / 2);
		ctx.restore();
	};
	
	Tile.canMerge = function (tile1, tile2) {
	  return tile1.value === tile2.value && !(tile1.merged || tile2.merged);
	}
	
	module.exports = Tile;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map