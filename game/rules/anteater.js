/**
 * ПРАВИЛО: Муравьед
 * С вероятностью chance муравей может быть съеден муравьедом.
 * на текущей клетке игрового поля
 */
var Chance = new require('chance')();

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
	if (Chance.bool({likelihood: constructor.params.chance}))
		unit.emitDestroy();

};


