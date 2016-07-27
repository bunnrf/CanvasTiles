const Tile = require('./tile');

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
