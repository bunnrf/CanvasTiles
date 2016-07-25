const GameView = function (game, ctx) {
  this.ctx = ctx;
  this.game = game;
  this.scoreEl = document.getElementsByClassName("score")[0];
  this.highScoreEl = document.getElementsByClassName("highscore")[0];
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
    this.game.moveTiles(GameView.KEYCODES[event.keyCode]);
  };

  requestAnimationFrame(this.animate.bind(this));
};

GameView.prototype.bindKeyHandlers = function () {
  window.addEventListener("keydown", this.handleArrow.bind(this) );
};

GameView.prototype.start = function () {
  this.bindKeyHandlers();

  requestAnimationFrame(this.animate.bind(this));
};

GameView.prototype.animate = function() {
  this.game.draw(this.ctx);
  this.updateScore();
};

GameView.prototype.updateScore = function () {
  this.scoreEl.textContent = this.game.score;
  if (this.game.score > this.highScoreEl.textContent) {
    this.highScoreEl.textContent = this.game.score;
  }
};

module.exports = GameView;
