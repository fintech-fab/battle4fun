var StateModel = require('../database/state.js');

/**
 * @param mapId string имя карты
 * @param players Player[] спиок объектов игроков
 * @returns {adapter.deferred.promise|*|promise.promise|jQuery.promise|Deferred.promise}
 */
module.exports = {

	client: function (gameId, playerId, unitId, position, command, mode, step) {

		var state = {
			author: 'player',
			gameId: gameId,
			playerId: playerId,
			unitId: unitId,
			position: position,
			command: command,
			mode: mode,
			step: step
		};

		console.log('create state by client:' + JSON.stringify(state));

		var State = new StateModel(state);
		State.save(function (err) {
			console.log('saved new state [' + err + ']');
		});

	},

	server: function (gameId, playerId, unitId, position, action, result, step) {

		var state = {
			author: 'server',
			gameId: gameId,
			playerId: playerId,
			unitId: unitId,
			position: position,
			command: action,
			mode: 'auto',
			result: result,
			step: step
		};

		console.log('create state by server:' + JSON.stringify(state));

		var State = new StateModel(state);
		State.save(function (err) {
			console.log('saved new state [' + err + ']');
		});

	}

};




