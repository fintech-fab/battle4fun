var socket = require('socket.io-client')(global.SERVER_URL);
var options = {};

// bootstrap function
module.exports = connect;
function connect(opt) {

	var $this = this;

	options = opt;

	// сервер сообщает о начале игры и передает данные юнитов
	socket.on('start', function (units) {
		options.start(units);
	});

	// сервер сообщает что юнит готов к следующему ходу
	socket.on('ready', function (data) {
		// id юнита и его обстановка
		options.ready(data.id, data.position, $this.move, $this.hold);
	});

	// сервер сообщает что юнит был уничтожен
	socket.on('destroy', function (data) {
		options.destroy(data.id);
	});

	// сервер сообщает что был создан новый юнит
	socket.on('create', function (data) {
		// id юнита и его обстановка
		options.create(data.id, data.position, $this.move, $this.hold);
	});

	/**
	 * передат команду на следующий ход
	 * например, "двигаться вверх в режиме атаки"
	 * или "двигаться вправо в режиме защиты"
	 *
	 * @param id
	 * @param direction top|down|left|right
	 * @param mode defense|attack
	 */
	this.move = function (id, direction, mode) {

		mode = mode || 'defence';
		direction = direction || 'top';

		socket.emit('move', {
			id: id,
			direction: direction,
			mode: mode
		});
		console.log('player [' + options.name + '] unit [' + id + '] command [move] direction[' + direction + '] mode [' + mode + ']');

	};

	/**
	 * передает команду на следующий ход, стоять на месте
	 * в режмиме атаки или защиты
	 *
	 * @param id
	 * @param mode defense|attack
	 */
	this.hold = function (id, mode) {

		mode = mode || 'defence';

		socket.emit('hold', {
			id: id,
			mode: mode
		});

	};

}

// сервер жмет нам руку
socket.on('handshake', function () {
	console.log('handshake successful');

	var data = {
		name: options.name
	};

	/**
	 * не будем тупить и в ответ передаем ему свои данные
	 * сервер зарегистрирует нас игроком
	 * и дальше будем ждать команды start
	 */
	socket.emit('name', data);

	console.log('data sent: ' + JSON.stringify(data));

});


// просто логируем
socket.on('connect', function () {
	console.log('connected');
});
socket.on('connect_error', function () {
	console.log('connection error: ' + arguments);
});
// todo в данный момент новое подключение не сработает
// сервер принимает данные после рукопожатия только один раз
socket.on('disconnect', function () {
	console.log('disconnect');
	connect(options);
});
