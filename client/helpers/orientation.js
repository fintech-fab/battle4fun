module.exports = orientation;

function orientation(position) {

	var blocks = position.blocks,
		x = position.x,
		y = position.y;

	/**
	 * @author mikanoz
	 * можно двигаться в любом направлении
	 */
	this.isOpenAllDirections = function (distance) {
		distance = distance || 1;
		return (
		!this.isBlockedTop(distance) && !this.isBlockedDown(distance) && !this.isBlockedRight(distance) && !this.isBlockedLeft(distance)
		);

	};


	this.isBlockedTop = function (distance) {
		distance = distance || 1;
		for (var d = 1; d <= distance; d++) {
			for (var i = 0, qnt = blocks.length; i < qnt; i++) {
				if (x == blocks[i][0] && y + distance == blocks[i][1]) {
					return true;
				}
			}
		}
		return false;
	};

	this.isBlockedDown = function (distance) {
		distance = distance || 1;
		for (var d = 1; d <= distance; d++) {
			for (var i = 0, qnt = blocks.length; i < qnt; i++) {
				if (x == blocks[i][0] && y - distance == blocks[i][1]) {
					return true;
				}
			}
		}
		return false;
	};

	this.isBlockedRight = function (distance) {
		distance = distance || 1;
		for (var d = 1; d <= distance; d++) {
			for (var i = 0, qnt = blocks.length; i < qnt; i++) {
				if (x + distance == blocks[i][0] && y == blocks[i][1]) {
					return true;
				}
			}
		}
		return false;
	};

	this.isBlockedLeft = function (distance) {
		distance = distance || 1;
		for (var d = 1; d <= distance; d++) {
			for (var i = 0, qnt = blocks.length; i < qnt; i++) {
				if (x - distance == blocks[i][0] && y == blocks[i][1]) {
					return true;
				}
			}
		}
		return false;
	};


	this.getFreeDirections = function (distance, strong) {

		strong = strong || false;
		distance = distance || 3;

		var directions = [];

		if (!this.isBlockedDown(distance)) {
			directions.push(2);
		}
		if (!strong && !this.isBlockedDown(distance) && !this.isBlockedLeft(distance)) {
			directions.push(1);
		}
		if (!this.isBlockedLeft(distance)) {
			directions.push(4);
		}
		if (!strong && !this.isBlockedTop(distance) && !this.isBlockedLeft(distance)) {
			directions.push(7);
		}
		if (!this.isBlockedTop(distance)) {
			directions.push(8);
		}
		if (!strong && !this.isBlockedTop(distance) && !this.isBlockedRight(distance)) {
			directions.push(9);
		}
		if (!this.isBlockedRight(distance)) {
			directions.push(6);
		}
		if (!strong && !this.isBlockedRight(distance) && !this.isBlockedDown(distance)) {
			directions.push(3);
		}

		return directions;

	};


}