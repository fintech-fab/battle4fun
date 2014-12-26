var Chance = new require('chance')();

/**
 * модуль поединков
 */
module.exports = function (constructor) {

	var TAG = "battle";

	log("start component");

	// players все игроки
	var players = constructor.Players;
	// все юниты
	var units = [];

	var distance = constructor.params.distance;
	var defaultChance = constructor.params.defaultChance;
	var attackChanceRatio = constructor.params.attackChanceRatio;
	var defenceChanceRatio = constructor.params.defenceChanceRatio;

	// собираем всех живых юнитов, находящихся в режиме аттаки
	for (var p = 0, qnt = players.length; p < qnt; p++) {

		var playerUnits = constructor.Players[p].units;

		for (var u = 0, uqnt = playerUnits.length; u < uqnt; u++) {
			var unit = playerUnits[u];

			if (unit.$destroy) {
				continue;
			}
			if (unit.mode !== 'attack') {
				continue;
			}
			if (unit.enemies.length == 0) {
				continue;
			}

			units.push(unit);
		}

	}

	log("units: " + units.length);

	function inDistance(attacker, defender) {
		return (attacker.x <= defender.x + distance && attacker.x >= defender.x - distance)
			&& (attacker.y <= defender.y + distance && attacker.y >= defender.y - distance)
			&& !(attacker.x == defender.x - distance && attacker.y == defender.y - distance)
			&& !(attacker.x == defender.x - distance && attacker.y == defender.y + distance)
			&& !(attacker.x == defender.x + distance && attacker.y == defender.y - distance)
			&& !(attacker.x == defender.x + distance && attacker.y == defender.y + distance);
	}

	// начинаем сражение
	for (var i = 0, qnt = units.length; i < qnt; i++) {
		// атакующий юнит
		var attacker = units[i];


		// обороняющиеся юниты в пределах distance
		var defenders = [];
		for (var d = 0, dqnt = units.length; d < dqnt; d++) {
			// пропускаем текущего юнита
			if (i == d) {
				log("EQUAL");
				continue;
			}
			// находится ли юнит в пределах distance
			log("inDistance: " + inDistance(attacker, units[d]));
			if (!inDistance(attacker, units[d])) {
				continue;
			}

			defenders.push(units[d]);
		}

		log("defenders: " + defenders.length);

		if (defenders.length == 0) {
			continue;
		}

		// выбираем случайного обороняющегося юнита
		var randomDefenderIndex = Chance.integer({min: 0, max: defenders.length - 1});
		var defender = defenders[randomDefenderIndex];

		// вычисляем шанс убийства
		var chance = defaultChance;
		if (attacker.mode === 'attack') {
			chance = defaultChance;
		}
		else {
			// если юнит не в режиме атаки
			// шанс убийства - 0
			chance = 0;
		}

		// если атакованный юнит в режиме атаки
		// шанс падает в attackChanceRatio раз
		// если атакованный юнит в режиме защиты
		// шанс падает в defenceChanceRatio раз
		if (defender.mode === 'attack') {
			chance = chance / attackChanceRatio;
		}
		else if (defender.mode === 'defence') {
			chance = chance / defenceChanceRatio;
		}

		log("chance to kill: " + chance + "%");

		var kill = Chance.bool({likelihood: chance});

		log("unit kills? " + kill);

		if (kill) {
			defender.emitDestroy();

			log("defender has been killed");
		}

	}

	function log(message) {
		console.log(TAG + ": " + message);
	}

};