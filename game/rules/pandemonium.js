/**
 * модуль рассчитывающий вероятность потерь
 * от столпотворения игроков одной команды
 * на одной игровой клетке
 */


/**
 * @param {Unit[]} units юниты одного игрока
 * @param {Array} base координаты базы
 * @param {Number} size размер толпы, при которой начинается печалька
 * @param {Number} chance процент вероятности гибели юнита в толпе
 * @return {Unit[]} юниты которые умерли в толпе
 */
module.exports = function (units, base, size, chance){

	var key, Unit, cells = {}, failsIds = [];

	// собираем юнитов по клеткам
	for(var i= 0, qnt = units.length; i < qnt; i++){

		Unit = units[i];

		// юниты на базе не считаются
		if(Unit.x == base[0] && Unit.y == base[1]){
			continue;
		}

		key = Unit.x + '-' + Unit.y;
		if(!cells[key]){
			cells[key] = [];
		}
		cells[key].push(Unit);

	}

	for(i in cells){

		if (!cells.hasOwnProperty(i)) {
			continue;
		}

		// толпой считаем больше size человек
		if(cells[i].length >= size){


			// рассчитываем вероятность гибели юнитов
			var rand = Math.floor( Math.random() * cells[i].length );

			// с вероятностью chance%, убиваем одного юнита
			if(Math.random() * 100 <= chance) {
				failsIds.push(cells[i][rand]);
			}

		}

	}

	return failsIds;

};


