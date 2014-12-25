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

	name: 'ayvan',
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


		var possible = orient.getFreeDirections();
		var rand;

		// если не задана стратегия
		if (this.memory.isEmpty(id)) {

			// определим свободные направления
			if (possible.length > 0) {

				// и побежим куда нибудь
				rand = Math.floor(Math.random() * possible.length);
				this.memory.setMoveStrategy(id, possible[rand]);

			}

		} else {
			// получим текущее направление
			var currentDirection = this.memory.getMoveStrategy(id);
			//если есть свободные направления, и при этом среди них нет текущего (уткнулись куда-то) - меняем направление
			if (possible.length > 0 && possible.indexOf(currentDirection) == -1) {
				// и побежим куда нибудь
				rand = Math.floor(Math.random() * possible.length);
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
