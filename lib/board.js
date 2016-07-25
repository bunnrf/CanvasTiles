const Tile = require('./tile');

const Board = function (size, type) {
  this.size = size;
  this.type = type;
  this.grid = this.emptyGrid();

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
  for (let i = 16; i > 0; i--) {
    pos = this.getRandomAvailablePosition();
    this.setTile(pos, Math.pow(2, i));
  }
};

Board.prototype.clearTile = function (pos) {
  this.grid[pos[0]][pos[1]] = null;
};

Board.prototype.getTile = function (pos) {
  return this.grid[pos[0]][pos[1]];
};

Board.prototype.setTile = function (pos, value) {
  const tile = new Tile(pos, value);

  this.grid[pos[0]][pos[1]] = tile;
};

Board.prototype.moveTiles = function (direction, scoreCallback) {
  let col;
  let firstMovablePos;
  let newPos = [0, 0];
  let moved = false;

  const grid = this.grid.slice();
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
        this.moveTile(tile.pos, firstMovablePos, scoreCallback);
      }
    });
  });

  return moved;
};

// return position of nearest free space or mergable tile
Board.prototype.firstMovablePos = function (pos, direction) {
  let nextPos = [pos[0] + direction[0], pos[1] + direction[1]];
  while (this.inBounds(nextPos) && (this.freeTile(nextPos) || (this.getTile(nextPos).value === this.getTile(pos).value && !this.getTile(nextPos).merged))) {
    nextPos = [nextPos[0] + direction[0], nextPos[1] + direction[1]];
  }

  return [nextPos[0] - direction[0], nextPos[1] - direction[1]];
};

Board.prototype.inBounds = function (pos) {
  return pos[0] >= 0 && pos[0] < this.size && pos[1] >= 0 && pos[1] < this.size;
};

Board.prototype.moveTile = function (pos, newPos, scoreCallback) {
  const tile = this.getTile(pos);
  const existingTile = this.getTile(newPos);

  if (existingTile && Tile.canMerge(tile, existingTile)) {
    scoreCallback(existingTile.merge(this.nextValue.bind(this)));
  } else {
    this.setTile(newPos, tile.value);
  }

  this.clearTile(pos);
};

Board.prototype.nextValue = function (value) {
  switch (this.type) {
    case "PRIMES":
      return nextPrime(value);
      break;
    case "CLASSIC":
    default:
      return value * 2;
      break;
  }
};

Board.prototype.setRandomTile = function () {
  const pos = this.getRandomAvailablePosition();
  this.setTile(pos, Board.SEEDS[this.type][Math.random() > .9 ? 1 : 0]);
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
  let count = 0;
  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.grid[i].length; j++) {
      if (!this.getTile([i, j])) { return true }
    }
  }

  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.grid[i].length; j++) {
      if (this.adjacentMergeableTile(this.grid[i][j])) {
        return true;
      }
    }
  }

  return false;
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
  const grid = this.grid;

  ctx.clearRect(0, 0, this.dim_x, this.dim_y);

  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const tile = grid[i][j];
      if (tile) {
        tile.draw(ctx, (i + 1) * this.margin + i * this.tileDim_x,
                       (j + 1) * this.margin + j * this.tileDim_y,
                       this.tileDim_x, this.tileDim_y);
      }
    }
  }
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
