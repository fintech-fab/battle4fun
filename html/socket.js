var io = require('socket.io').listen(8888);

var fetchGame = require('../game/item.js');
var fetchMap = require('../map/item.js');
var fetchStates = require('../game/states.js');
var gameModel = require('../database/game.js');

io.sockets.on('connection', function (socket) {

	console.log('server connection');

	// жмем браузеру руку
	socket.emit('handshake');

	socket.on('list', function() {
						gameModel.find(function(err, gamesList) {
											var list = [];
											if (err) {

											} else {
												for (var i = 0; i < gamesList.length; i++)
													list.push(gamesList[i].id)
											};

											socket.emit('list', list);
						})
	});

	// ждем id игры
	socket.on('game', function (gameId) {

		// игра
		fetchGame(gameId, function (Game) {
			// карта
			fetchMap(Game.mapId, function (Map) {
				// ходы
				fetchStates(Game._id, function (States) {
					// в браузер
					socket.emit('game', {
						Game: Game,
						Map: Map,
						States: States
					});
				});
			});
		});

	});

});

