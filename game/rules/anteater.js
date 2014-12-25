/**
 * ПРАВИЛО: Муравьед
 * С вероятностью chance муравей может быть съеден муравьедом.
 * на текущей клетке игрового поля
 */


/**
 * @return {Unit[]} юнит, которого съели
 */
module.exports = function (constructor) {

	var key, unit, cells = {}, failsIds = [];

	// Текущий юнит
	var unit = constructor.Unit;
	// base координаты базы
	var base = constructor.MapModel.bases[constructor.Unit.Player.baseNumber()];

	/** @namespace constructor.params.chance */
	// chance - вероятность быть съеденым муравьедом
	var chance = constructor.params.chance / 100;

	if (Math.random() <= chance)
	    unit.emitDestroy();

};


