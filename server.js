var io = require('socket.io').listen(8080);
var defer = require("node-promise").defer;

var CONFIG = {
	players: 1, // количество игроков
	mapId: 'simple' // карта
};

// реестр игроков
var PlayerCollection = {
	list: [],
	deferred: readyPlayers = defer(),
	promise: undefined,
	init: function () {
		this.promise = this.deferred.promise;
		return this;
	},
	add: function (Player) {
		this.list.push(Player);
		console.log('new player added, ready: ' + this.list.length + ' players');
		if (this.complete()) {
			this.ready();
		}
		Player.number = this.list.length;
	},
	complete: function () {
		return (this.list.length == CONFIG.players);
	},
	ready: function () {
		console.log('players is ready');
		this.deferred.resolve();
	}
};

// запускаем коллекцию и ждем игроков
PlayerCollection.init().promise.then(function () {
	console.log('players is ready, start new game...');
	// начинаем игру
	StartNewGame();
});

// подключение игроков
io.sockets.on('connection', function (socket) {
	console.log('server new connection');
	socket.emit('handshake');

	// новых не пропускаем
	if (PlayerCollection.complete()) {
		console.log('disable new player connection');
		return socket.close();
	}

	// в текущем подключении игрок передает свои данные
	socket.on('name', function (data) {
		// добавляем в коллекцию нового игрока
		PlayerCollection.add(new Player(data, socket));
	});

});

function StartNewGame() {

	require('./game/create.js')(CONFIG.mapId, PlayerCollection.list).then(function (Game) {
		console.log(Game);
	});

}


function Player(data, client) {

	var name = data.name;
	this.number = undefined;
	this.getName = function () {
		return name;
	}

	this.units = [];
	this.startPosition = {
		x: 0,
		y: 0,

		// заблокированные клетки
		blocks: [
			[3, 3]
		],

		// еда
		eat: [
			2, 3
		],

		// своя база
		base: [
			0, 0
		],

		// враг
		enemy: [],

		// вражеская база
		enemyBase: []
	};

	this.createUnits = function (num) {
		this.units.push({
			id: 1,
			position: this.startPosition
		});
	};

	this.startMessage = function () {
		socket.emit('start', this.units);
		for (var i = 0, unit, qnt = this.units; i < qnt; i++) {
			socket.emit('ready', this.units);
		}
	};

}
