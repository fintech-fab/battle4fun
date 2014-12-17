/**
 * модуль рассчитывающий вероятность потерь
 * от столпотворения игроков одной команды
 * на одной игровой клетке
 */


/**
 * @return {Unit[]} юниты которые умерли в толпе
 */
module.exports = function (constructor) {

	var key, Unit, cells = {}, failsIds = [];

	// units юниты одного игрока
	var units = constructor.Unit.Player.units;
	// base координаты базы
	var base = constructor.MapModel.bases[constructor.Unit.Player.baseNumber()];
	// size размер толпы, при которой начинается печалька
	var size = constructor.params.size;
	/** @namespace constructor.params.chance */
	// chance процент вероятности гибели юнита в толпе
	var chance = constructor.params.chance;

	// собираем юнитов по клеткам
	for (var i = 0, qnt = units.length; i < qnt; i++) {

		Unit = units[i];

		// если юнит уже мертв - не учитываем
		if (Unit.$destroy) {
			continue;
		}

		// юниты на базе не считаются
		if (Unit.x == base[0] && Unit.y == base[1]) {
			continue;
		}

		key = Unit.x + '-' + Unit.y;
		if (!cells[key]) {
			cells[key] = [];
		}
		cells[key].push(Unit);

	}

	for (i in cells) {

		if (!cells.hasOwnProperty(i)) {
			continue;
		}

		// толпой считаем больше size человек
		if (cells[i].length >= size) {


			// рассчитываем вероятность гибели юнитов
			var rand = Math.floor(Math.random() * cells[i].length);

			// с вероятностью chance%, убиваем одного юнита
			if (Math.random() * 100 <= chance) {

				cells[i][rand].emitDestroy();

			}

		}

	}

};


