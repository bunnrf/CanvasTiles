const Board = require('./board');

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

  this.board = new Board(size, gameType);
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
  if (this.board.moveTiles(delta, this.addScore.bind(this))) {
    this.board.setRandomTile();
  }

  if (!this.board.movePossible()) {
    this.over = true;
    setTimeout(() => {
      alert("No moves possible. Game over.");
    }, 2000)
  }
};

Game.prototype.addScore = function (amount) {
  this.score += amount;
};

Game.prototype.draw = function (ctx) {
  this.board.draw(ctx);
};

module.exports = Game;
