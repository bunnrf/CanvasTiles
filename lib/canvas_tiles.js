const Game = require("./game");
const GameView = require("./game_view");

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
