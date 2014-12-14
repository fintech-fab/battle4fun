global.SERVER_URL = 'http://localhost:8080/';

var units = [];

var client = require('./client.js')({

	name: 'batman',

	/**
	 * начало игры, данные юнитов
	 * @param units
	 */
	start: function (units) {
		console.log('units: ' + JSON.stringify(units));
	},

	/**
	 * юнит готов к следующему ходу
	 * @param id
	 * @param position
	 */
	ready: function (id, position) {
		console.log('ready unit [' + id + '] on ' + JSON.stringify(position));
	},

	/**
	 * появился новый юнит!
	 * @param id
	 * @param position
	 */
	create: function (id, position) {
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
