var defer = require("node-promise").defer;
var deferred = defer();
var GameModel = require('../database/game.js');

/**
 * @param mapId string имя карты
 * @param players Player[] спиок объектов игроков
 * @returns {adapter.deferred.promise|*|promise.promise|jQuery.promise|Deferred.promise}
 */
module.exports = function (mapId, players) {

	var game = {
		mapId: mapId,
		players: {}
	};

	console.log('create game by players:' + JSON.stringify(players));

	for (var i = 0, qnt = players.length; i < qnt; i++) {

		var Player = players[i];
		game.players[Player.number] = {
			name: Player.getName(),
			stat: {
				score: 0,
				steps: 0,
				frags: 0,
				birth: 0
			}
		};

	}
	console.log('create new game by data:' + JSON.stringify(game));
	var Game = new GameModel(game);
	Game.save(function (err) {
		console.log('create new game [' + err + ']');
		deferred.resolve(Game);
	});

	return deferred.promise;
};





