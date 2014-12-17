module.exports = memory;

function memory(units) {

	/**
	 * установить новые данные юнита
	 * @param id
	 * @param unit
	 */
	this.set = function (id, unit) {
		index[id] = unit;
	};

	var index = {};
	var solutions = {};
	var exists = {};

	for (var i = 0, qnt = units.length; i < qnt; i++) {
		this.set(units[i].id, units[i]);
		solutions[units[i].id] = {};
	}

	/**
	 * приказать двигаться в направлении
	 *
	 * 7   8   9
	 *
	 * 4       6
	 *
	 * 1   2   3
	 *
	 * @param id
	 * @param direction
	 */
	this.setMoveStrategy = function (id, direction) {
		solutions[id].moveStrategy = {
			direct: direction, // куда двигаться
		};
		exists[id] = true;
	};

	/**
	 * новые координаты согласно стратегрии движения
	 * @param id
	 */
	this.getDirectByMoveStrategy = function (id) {

		var sol = this.getMoveStrategy(id);
		if (false === sol) {
			return null;
		}

		switch (sol.direct) {
			case 8:
				return 'top';
				break;
			case 6:
				return 'right';
				break;
			case 2:
				return 'down';
				break;
			case 4:
				return 'left';
				break;
			case 7:
				return Math.random() * 10 > 5 ? 'left' : 'top';
				break;
			case 9:
				return Math.random() * 10 > 5 ? 'right' : 'top';
				break;
			case 3:
				return Math.random() * 10 > 5 ? 'right' : 'down';
				break;
			case 1:
				return Math.random() * 10 > 5 ? 'left' : 'down';
				break;
			default:
				break;
		}

	};

	this.getMoveStrategy = function (id) {
		return this.getSolution(id, 'moveStrategy');
	};

	/**
	 * стратегия патрулирования
	 * @param id
	 * @param direction в какую сторону
	 * @param distance на какое расстояние
	 */
	this.setPatrolStrategy = function (id, direction, distance) {
		solutions[id].patrolStrategy = {
			direction: direction,
			point1: [
				index[id].x,
				index[id].y
			],
			point2: [
				index[id].x + this.calcPos(direction, distance).x,
				index[id].y + this.calcPos(direction, distance).y
			],
			to: 'point2',
			last: undefined
		};
		exists[id] = true;
	};

	/**
	 * посчитать направление по стратегии патрулирования
	 * @param id
	 */
	this.getDirectByPatrolStrategy = function (id) {

		var Unit = index[id];
		var sol = this.getSolution(id, 'patrolStrategy');
		var newDir = undefined;

		// сейчас юнит двигается к точке 1
		if (sol.to == 'point1') {
			// если он в ней находится, меняем направление
			if (sol.point1[0] == Unit.x && sol.point1[1] == Unit.y) {
				sol.to = 'point2';
			}
		}

		// сейчас юнит двигается к точке 2
		if (sol.to == 'point2') {
			// если он в ней находится, меняем направление
			if (sol.point2[0] == Unit.x && sol.point2[1] == Unit.y) {
				sol.to = 'point1';
			}
		}

		// определяем направление - прямое
		if (sol.to == 'point2') {
			newDir = this.calcStrongDirection(sol.direction, sol.last);
		}
		// обратное
		if (sol.to == 'point1') {
			newDir = this.calcStrongDirection(
				this.calcInverseDirection(sol.direction),
				sol.last
			);
		}

		sol.last = newDir;
		return newDir;

	};

	this.getSolution = function (id, name) {
		return solutions[id][name] || false;
	};

	this.isEmpty = function (id) {
		return !exists[id];
	};


	this.calcPos = function (direction, distance) {
		var x = 0, y = 0;
		switch (direction) {
			case 8:
				y += distance;
				break;
			case 9:
				y += distance;
				x += distance;
				break;
			case 6:
				x += distance;
				break;
			case 3:
				x += distance;
				y -= distance;
				break;
			case 2:
				y -= distance;
				break;
			case 1:
				y -= distance;
				x -= distance;
				break;
			case 4:
				x -= distance;
				break;
			case 7:
				y += distance;
				x -= distance;
				break;
			default:
				break;
		}
		return {x: x, y: y};
	};


	/**
	 * посчитать куда двигаться, без случайностей
	 * @param direction
	 * @param last
	 */
	this.calcStrongDirection = function (direction, last) {

		switch (direction) {
			case 8:
				return 'top';
			case 6:
				return 'right';
			case 2:
				return 'down';
			case 4:
				return 'left';
			case 9:
				last = last || 'top';
				return (last == 'top') ? 'right' : 'top';
			case 3:
				last = last || 'right';
				return (last == 'right') ? 'down' : 'right';
			case 1:
				last = last || 'down';
				return (last == 'down') ? 'left' : 'down';
			case 7:
				last = last || 'left';
				return (last == 'left') ? 'top' : 'left';
			default:
				break;
		}

	};

	/**
	 * посчитать куда двигаться, без случайностей
	 * @param direction
	 */
	this.calcInverseDirection = function (direction) {

		switch (direction) {
			case 8:
				return 2;
			case 9:
				return 1;
			case 6:
				return 4;
			case 3:
				return 7;
			case 2:
				return 8;
			case 1:
				return 9;
			case 4:
				return 6;
			case 7:
				return 3;
			default:
				break;
		}

	};

}