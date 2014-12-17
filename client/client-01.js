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

	name: 'mikanoz',
	memory: undefined,

	// один патрульный
	patrolId: undefined,

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

		// одного назначим патрулировать
		if(this.setPatrol(id, orient, move)){
			return;
		}


		// если не задана стратегия
		if (this.memory.isEmpty(id)) {

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

	setPatrol: function(id, orient, move){

		// кто-то другой уже патрулирует
		if(this.patrolId && this.patrolId != id){
			return false;
		}

		if(!this.patrolId) {

			this.patrolId = id;

			// если справа свободно, ходи туда-сюда на 5 клеток
			if (!orient.isBlockedRight(3)) {
				this.memory.setPatrolStrategy(id, 6, 5);
			}

			// или если свободно слева
			if (!orient.isBlockedLeft(3)) {
				this.memory.setPatrolStrategy(id, 4, 5);
			}

		}

		// сразу отправим погулять
		var direction = this.memory.getDirectByPatrolStrategy(id);
		move(id, direction, MOD_ATTACK);

		// отвечаем что патрульный был назначен
		return true;

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
