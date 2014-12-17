var io = require('socket.io').listen(8888);

var fetchGame = require('../game/item.js');
var fetchMap = require('../map/item.js');
var fetchStates = require('../game/states.js');

io.sockets.on('connection', function (socket) {

	console.log('server connection');

	// жмем браузеру руку
	socket.emit('handshake');

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

