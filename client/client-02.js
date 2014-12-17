var orientation = require('./helpers/orientation.js');
var memory = require('./helpers/memory.js');
global.SERVER_URL = 'http://localhost:7777/';

var units = [];
var DIR_TOP = 'top';
var DIR_LEFT = 'left';
var DIR_RIGHT = 'right';
var DIR_DOWN = 'down';
var MOD_ATTACK = 'attack';
var MOD_DEF = 'defence';

var client = require('./client.js')({

	name: 'batman',
	memory: undefined,

	/**
	 * начало игры, данные юнитов
	 * @param units
	 */
	start: function (units) {
		console.log('units: ' + JSON.stringify(units));
		this.memory = new memory(units);
	},

	/**
	 * юнит готов к следующему ходу
	 * @param id
	 * @param position
	 * @param hold
	 * @param move
	 */
	ready: function (id, position, move, hold) {

		console.log('ready unit [' + id + '] on ' + JSON.stringify(position));

		// оперативная память движений юнита
		this.memory.set(id, position);

		// помощник по ориентированию в закрытом пространстве
		var orient = new orientation(position);

		// если не задана стратегия движения
		if (!this.memory.getMoveStrategy(id)) {

			// определим свободные направления
			var possible = orient.getFreeDirections();
			if (possible.length > 0) {

				// и побежим куда нибудь
				var rand = Math.floor(Math.random() * possible.length);
				this.memory.setMoveStrategy(id, possible[rand]);

			}

		}

		var direction = this.memory.getDirectByMoveStrategy(id);
		if (!direction) {

			// запутались, постоим на месте
			hold(id, MOD_DEF);

		} else {

			// осторожно бежим
			move(id, direction, MOD_DEF);

		}

	},

	/**
	 * появился новый юнит!
	 * @param id
	 * @param position
	 * @param hold
	 * @param move
	 */
	create: function (id, position, move, hold) {
		console.log('create unit [' + id + '] on ' + JSON.stringify(position));
	},

	/**
	 * юнит выполнил свой долг :(
	 * @param id
	 */
	destroy: function (id) {
		console.log('unit [' + id + '] is die :(');
	}

});
