module.exports = GameComponent;

/**
 * старт игры
 *      назначить игроков по базам
 *      создать игрокам юнита на базе
 *      создать юнитам позицию
 *          текущие координаты
 *          видимость блоков, врагов, еды
 */

/**
 *
 * @param Config
 * @param {mongoose.model} GameModel
 * @param {mongoose.model} MapModel
 * @param {Player[]} Players
 * @constructor
 *
 * @namespace MapModel.bases
 */
function GameComponent(Config, GameModel, MapModel, Players) {

	this.Config = Config;
	this.MapModel = MapModel;
	this.GameModel = GameModel;
	this.Players = Players;
	this.units = [];
	this.unitPlayer = [];
	var $this = this;

	/**
	 * пусть начнется этот треш
	 */
	this.start = function () {
		createStartUnit();
		calculatePositions();
		emitStartMessages();
	};

	/**
	 * отправляем всем игрокам сообщение
	 * что их юниты готовы к бою
	 */
	function emitStartMessages() {

		for (var i = 0, qnt = $this.Players.length; i < qnt; i++) {
			$this.Players[i].gameId = $this.GameModel._id;
			$this.Players[i].emitStartGame();
			$this.Players[i].Game = $this;
		}

	}

	/**
	 * игрок сделал следующий ход, переместив своего юнита
	 * @param Unit
	 */
	this.onMoveUnit = function (Unit) {

		// юнит мертв и мы уходим отсюда горько плакая и ничего не делая
		if (Unit.$destroy) {
			return;
		}

		// пересчитываем позицию юнита
		Unit.initFriendPosition();
		Unit.initEnemyPosition($this.units);
		Unit.initBlocksPosition($this.MapModel.blocks, $this.MapModel.area.width, $this.MapModel.area.height);
		//Unit.initEatPosition($this.MapModel.eats);
		Unit.initBasePosition($this.MapModel.bases);

		// если слишком много ходов, зависаем
		if (Unit.step > 100) {
			console.log('unit [' + Unit.id + '] too many steps, sleep it!');
			return;
		}

		// запускаем все правила
		var rules = this.Config.rules;
		var constructor = {
			Unit: Unit,
			MapModel: $this.MapModel,
			params: {}
		};
		var rule;
		for (var ruleKey in rules) {
			rule = rules[ruleKey];
			constructor.params = rule;
			require('./rules/' + ruleKey + '.js')(constructor);
		}

		// юнит готов к следующему ходу
		if (!Unit.$destroy) {
			Unit.emitReady();
		}

	};

	/**
	 * первичное создание юнитов для всех игроков
	 */
	function createStartUnit(counter) {

		var Player, Unit;
		counter = counter || 0;
		counter++;

		// создаем юнитов
		for (var i = 0, qnt = $this.Players.length; i < qnt; i++) {
			Player = $this.Players[i];

			// создаем юнита
			Unit = Player.createUnit($this.units.length);
			Unit.Player = Player;

			// заносим в общий список
			$this.units.push(Unit);
			Unit.id = $this.units.length - 1;
			Unit.playerNumber = Player.number;

			// указатель на игрока
			$this.unitPlayer.push(Player.number);

			// координаты  - на старте все юниты сидят на базе
			var base = $this.MapModel.bases[Player.baseNumber()];
			Unit.x = base[0];
			Unit.y = base[1];

			// отмечаем день рождения
			$this.stat.birth(Unit.playerNumber);

		}

		if (counter < 3) {
			createStartUnit(counter);
		}

	}

	/**
	 * расчет окружающей обстановки всех юнитов
	 * что видит и в каких координатах
	 */
	function calculatePositions() {

		var Unit,
			i,
			qnt = $this.units.length;

		// рассчитываем обстановку вокруг юнитов
		for (i = 0; i < qnt; i++) {

			// вокруг этого юнита считаем обстановку
			Unit = $this.units[i];

			// ищем объекты
			Unit.initFriendPosition();
			Unit.initEnemyPosition($this.units);
			Unit.initBlocksPosition($this.MapModel.blocks, $this.MapModel.area.width, $this.MapModel.area.height);
			//Unit.initEatPosition($this.MapModel.eats);
			Unit.initBasePosition($this.MapModel.bases);

		}

	}


	this.stat = {
		birth: function (pn) {
			$this.GameModel.players[pn].stat.birth++;
		}
	};


}
