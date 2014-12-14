var io = require('socket.io').listen(8081);
var map = require('../map/simple.js')(true);

io.sockets.on('connection', function (socket) {

	console.log('server connection');

	// жмем браузеру руку
	socket.emit('handshake');

	// получаем модель карты из базы
	map.then(function (item) {

		// бросаем браузеру, пусть рисует
		socket.emit('map', item);

	});

});

