var io = require('socket.io').listen(7777);
var defer = require("node-promise").defer;
var config = require('config');

var CONFIG = config.get('Rules').collection["type1"];

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

	// создание новой игры в базе
	require('./game/create.js')(CONFIG.mapId, PlayerCollection.list).then(function (GameModel) {
		console.log(GameModel);
		// загрузка карты игры
		require('./map/' + GameModel.mapId + '.js')().then(function (MapModel) {
			// запускаем игру в компоненте
			var component = require('./game/component.js');
			component = new component(CONFIG, GameModel, MapModel, PlayerCollection.list);
			component.start();
		});
	});

}


function Player(data, client) {

	var name = data.name;

	this.units = [];
	this.unitNum = {};

	this.number = undefined;
	this.gameId = undefined;
	this.Game = undefined;

	var $this = this;


	this.getName = function () {
		return name;
	};

	/**
	 * клиент сообщил серверу что хочет пододвинуть своего юнита
	 */
	client.on('move', function (cmd) {

		var Unit = $this.getUnit(cmd.id);
		var newPos = Unit.getNewPos(cmd.direction);

		Unit.setMode(cmd.mode);

		if (Unit.$destroy) {
			return;
		}

		// если позиция возможна
		if (newPos[2]) {
			Unit.x = newPos[0];
			Unit.y = newPos[1];
		}

		// запишем состояние юнита после хода игрока в базу
		require('./game/state.js').client(
			$this.gameId,
			$this.number,
			Unit.id,
			{x: Unit.x, y: Unit.y},
			'move',
			cmd.mode,
			Unit.stepUp()
		);

		// юнит переместился, передаем ответственность игре
		$this.Game.onMoveUnit(Unit);

	});

	/**
	 * юнит умер
	 * @param Unit
	 */
	this.emitUnitDestroy = function (Unit) {

		// запишем состояние юнита после хода игрока в базу
		require('./game/state.js').server(
			this.gameId,
			this.number,
			Unit.id,
			{x: Unit.x, y: Unit.y},
			'destroy',
			'destroy',
			Unit.step
		);

		// сообщаем клиенту о гибели юнита к следующему ходу
		client.emit('destroy', Unit.id);

	};

	/**
	 * готовность юнита к следующему ходу
	 * @param Unit
	 */
	this.emitUnitReady = function (Unit) {

		// собираем данные о юните для клиента
		var el = Unit.initPosition();

		// записываем решение сервера в историю
		require('./game/state.js').server(
			this.gameId,
			this.number,
			Unit.id,
			{x: Unit.x, y: Unit.y},
			'ready',
			'moved',
			Unit.step
		);

		// сообщаем клиенту о готовности юнита к следующему ходу
		client.emit('ready', {
			id: el.id,
			position: el
		});

	};

	/**
	 * @returns {Unit}
	 */
	this.createUnit = function (num) {
		var unit = new Unit();
		this.units.push(unit);
		this.unitNum[num] = this.units.length - 1;
		return unit;
	};

	this.baseNumber = function () {
		return this.number - 1;
	};


	/**
	 * сообщаем всем подключившимся клиентам о начале игры
	 * и передаем каждому список его юнитов
	 */
	this.emitStartGame = function () {

		var units = [], Unit;

		for (var i = 0, qnt = this.units.length; i < qnt; i++) {

			Unit = this.units[i];

			// собираем данные о юните для клиента
			var el = Unit.initPosition();

			units.push(el);

			// записываем появление юнита в базу
			require('./game/state.js').server(
				this.gameId,
				this.number,
				Unit.id,
				{x: Unit.x, y: Unit.y},
				'start',
				'initialized',
				Unit.step
			);

		}

		// сообщаем клиенту о старте списком его юнитов
		client.emit('start', units);

		console.log('emit start units for player [' + name + ']: ' + JSON.stringify(units));
		console.log('theatrical pause...');

		// через некоторое время рассылаем ready
		setTimeout(function () {
			for (var i = 0, qnt = $this.units.length; i < qnt; i++) {
				$this.emitUnitReady($this.units[i]);
			}
		}, 2000);

	};

	/**
	 * юнит по глобальному id
	 * @param i
	 * @returns {Unit}
	 */
	this.getUnit = function (i) {
		return this.units[this.unitNum[i]];
	}

}

function Unit() {

	this.x = undefined;
	this.y = undefined;
	this.id = undefined;
	this.playerNumber = undefined;
	this.Player = undefined;
	this.friends = [];
	this.enemies = [];
	this.blocks = [];
	this.eats = [];
	this.bases = [];
	this.step = 0;
	this.$destroy = false;

	/**
	 * выполнить ритуал уничтожения этого юнита
	 */
	this.emitDestroy = function () {
		this.$destroy = true;
		this.Player.emitUnitDestroy(this);
	};

	/**
	 * передать руководству что юнит ждет указаний
	 */
	this.emitReady = function () {
		this.Player.emitUnitReady(this);
	};

	/**
	 * сбор данных для клиента, когда сообщаем состояние юнита
	 * @returns {{x: *, y: *, id: *, friends: *, enemies: *, blocks: *, eats: *, bases: *}}
	 */
	this.initPosition = function () {
		return {
			x: this.x,
			y: this.y,
			id: this.id,
			friends: this.friends,
			enemies: this.enemies,
			blocks: this.blocks,
			eats: this.eats,
			bases: this.bases
		};
	};

	/**
	 * вызывать, когда юнит совершает следующий шаг
	 * @returns {number}
	 */
	this.stepUp = function () {
		this.step++;
		return this.step;
	};

	/**
	 * выяснить координаты юнита, если он передвинется по направлению direction
	 * @param direction
	 * @returns {*[]}
	 */
	this.getNewPos = function (direction) {

		var x = this.x,
			y = this.y;

		switch (direction) {
			case 'top':
				y++;
				break;
			case 'left':
				x--;
				break;
			case 'right':
				x++;
				break;
			case 'down':
				y--;
				break;

			default:
				break;
		}

		return [x, y, this.checkNewPos(x, y)];

	};

	/**
	 * установить, в каком режиме будет находиться юнит
	 * @param mode
	 */
	this.setMode = function (mode) {
		if (mode === 'attack' || mode === 'defence') {
			this.mode = mode;
		} else {
			this.mode = 'defence';
		}
	};

	/**
	 * проверить, может ли юнит передвинуться на эти координаты
	 * @param x
	 * @param y
	 * @returns {boolean}
	 */
	this.checkNewPos = function (x, y) {
		for (var i = 0, qnt = this.blocks.length; i < qnt; i++) {
			if (x == this.blocks[i][0] && y == this.blocks[i][1]) {
				return false;
			}
		}
		return true;
	};

	/**
	 * поиск вражеских баз
	 */
	this.initBasePosition = function (bases) {

		var i, qnt = bases.length;
		this.bases = [];
		for (i = 0; i < qnt; i++) {
			// своя база
			if (i == this.Player.baseNumber()) {
				continue;
			}
			if (this.descry(bases[i][0], bases[i][1])) {
				this.bases.push([bases[i][0], bases[i][1]]);
			}
		}

	};

	/**
	 * поиск друзей
	 */
	this.initFriendPosition = function () {

		var i, Unit, qnt = this.Player.units.length;
		this.friends = [];
		for (i = 0; i < qnt; i++) {
			Unit = this.Player.units[i];
			if (Unit.id == this.id) {
				continue;
			}
			if (this.descry(Unit.x, Unit.y)) {
				this.friends.push([Unit.x, Unit.y]);
			}
		}

	};

	/**
	 * @param eats еда
	 */
	this.initEatPosition = function (eats) {

		var i, qnt = eats.length;
		this.eats = [];
		for (i = 0; i < qnt; i++) {
			if (this.descry(eats[i][0], eats[i][1])) {
				this.eats.push([eats[i][0], eats[i][1]]);
			}
		}

	};

	/**
	 * @param units все юниты
	 */
	this.initEnemyPosition = function (units) {

		var i, Unit, qnt = units.length;
		this.enemies = [];
		for (i = 0; i < qnt; i++) {
			Unit = units[i];
			// свой
			if (units[i].playerNumber == this.playerNumber) {
				continue;
			}
			// чужой
			if (this.descry(Unit.x, Unit.y)) {
				this.enemies.push([Unit.x, Unit.y]);
			}
		}

	};

	/**
	 * @param blocks все блокированные клетки
	 * @param width ширина карты
	 * @param height высота карты
	 */
	this.initBlocksPosition = function (blocks, width, height) {

		var i, x, y, qnt = blocks.length;
		this.blocks = [];

		// блокированные клетки на поле
		for (i = 0; i < qnt; i++) {
			if (this.descry(blocks[i][0], blocks[i][1])) {
				this.blocks.push([blocks[i][0], blocks[i][1]]);
			}
		}

		// верхняя и нижняя стенка
		for (x = 0; x < width + 1; x++) {
			if (this.descry(x, 0)) {
				this.blocks.push([x, 0]);
			}
			if (this.descry(x, height + 1)) {
				this.blocks.push([x, height + 1]);
			}
		}
		// левая и правая стенка
		for (y = 0; y < height + 1; y++) {
			if (this.descry(0, y)) {
				this.blocks.push([0, y]);
			}
			if (this.descry(width + 1, y)) {
				this.blocks.push([width + 1, y]);
			}
		}

	};


	/**
	 * видит ли игрок клетку с этими координатами
	 * @param x
	 * @param y
	 * @returns {boolean}
	 */
	this.descry = function (x, y) {
		// 3 клетки во все стороны, за исключением угловых
		var visibility = CONFIG.visibility;

		return (this.x <= x + visibility && this.x >= x - visibility)
			&& (this.y <= y + visibility && this.y >= y - visibility)
			&& !(this.x == x - visibility && this.y == y - visibility)
			&& !(this.x == x - visibility && this.y == y + visibility)
			&& !(this.x == x + visibility && this.y == y - visibility)
			&& !(this.x == x + visibility && this.y == y + visibility);

	};

}