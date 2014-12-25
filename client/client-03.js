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


		var possible;
		var rand;

		// если не задана стратегия
		if (this.memory.isEmpty(id)) {

			// определим свободные направления
			possible = orient.getFreeDirections(3);
			if (possible.length > 0) {

				// и побежим куда нибудь
				rand = Math.floor(Math.random() * possible.length);
				this.memory.setMoveStrategy(id, possible[rand]);

			}

		} else {
			// определим свободные направления
			possible = orient.getFreeDirections(3);
			// получим текущее направление
			var currentDirection = this.memory.getMoveStrategy(id).direct;

			 if(isNaN(currentDirection) && possible.length > 0){
				newDirection = Math.floor(Math.random() * possible.length);
				this.memory.setMoveStrategy(id, possible[newDirection]);
			}

			//если есть свободные направления, и при этом среди них нет текущего (уткнулись куда-то) - меняем направление
			if (possible.length > 0 && possible.indexOf(currentDirection) == -1 && !isNaN(currentDirection)) {
				var newDirection1 = 0;
				var newDirection2 = 0;
				var i = 1;
				var tempDirection = 0;

				//пройдемся от текущего направления в сторону "назад", найдем ближайшее доступное направление
				while(newDirection1 == 0) {
					tempDirection = currentDirection - i;
					// если вышли за пределы допустимых направлений
					if(tempDirection < 1){
						break;
					}

					if(possible.indexOf(tempDirection) >= 0){
						newDirection1 = tempDirection;
					}

					i++;
				}

				i = 1;
				//пройдемся от текущего направления в сторону "вперед", найдем ближайшее доступное направление
				while(newDirection2 == 0) {
					tempDirection = currentDirection + i;
					// если вышли за пределы допустимых направлений
					if(tempDirection > 9){
						break;
					}

					if(possible.indexOf(tempDirection) >= 0){
						newDirection2 = tempDirection;
					}

					i++;
				}
				// найдем, какое направление более оптимально (ближе к текущему)
				var newDirection;
				switch (true){
					case newDirection1 > 0 && newDirection2 > 0:
						var tmp1 = currentDirection - newDirection1;
						var tmp2 = newDirection2 - currentDirection;
						if(tmp1 = tmp2){
							// побежим куда нибудь
							newDirection = Math.floor(Math.random() * possible.length);
						} else if(tmp1 > tmp2){
							newDirection = newDirection2;
						} else {
							newDirection = newDirection1;
						}
						break;
					case  newDirection1 > 0:
						newDirection = newDirection1;
						break;
					case newDirection2 > 0 :
						newDirection = newDirection2;
						break;
					default:
						// побежим куда нибудь
						newDirection = Math.floor(Math.random() * possible.length);
				}
				this.memory.setMoveStrategy(id, possible[newDirection]);
			}
		}

		var direction = this.memory.getDirectByMoveStrategy(id);
		if (!direction) {

			// запутались, постоим на месте
			hold(id, MOD_DEF);

		} else {

			// осторожно бежим
			move(id, direction, MOD_ATTACK);

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
