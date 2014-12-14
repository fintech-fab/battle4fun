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
			last: null // куда был предыдущий шаг
		};
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

	this.getSolution = function (id, name) {
		return solutions[id][name] || false;
	};

}