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
