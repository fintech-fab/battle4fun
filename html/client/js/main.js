CELL_SIZE = 30;

var Area = {
	height: 0,
	width: 0,
	svg: d3.select('body').append("svg:svg").style('margin', '30px'),
	light: undefined,
	place: function () {
		this.svg.selectAll("*").remove();
		this.light = undefined;
	},
	cursor: function (x, y) {
		if (!this.light) {
			this.light = this.svg
					.append("rect")
					.attr("width", CELL_SIZE - 2)
					.attr("height", CELL_SIZE - 2)
					.style("fill", 'lightgreen')
					.attr("class", 'cursor');
		}
		x = x || -100;
		y = y || -100;
		y = this.height - y;
		this.light.attr('x', (x) * CELL_SIZE).attr('y', (y) * CELL_SIZE);
	},
	size: function (w, h) {
		this.height = h;
		this.width = w;
		this.svg.attr("width", (this.width + 2) * CELL_SIZE)
		        .attr("height", (this.height + 2) * CELL_SIZE)
	},
	plaza: function (x, y) {
		y = this.height - y;
		this.svg.append("rect").attr("x", (x) * CELL_SIZE)
		                       .attr("y", (y) * CELL_SIZE)
		                       .attr("width", CELL_SIZE - 2)
		                       .attr("height", CELL_SIZE - 2)
		                       .style("fill", 'lavender');
	},
	block: function (x, y) {
		y = this.height - y;
		return this.svg.append("rect").attr("x", (x) * CELL_SIZE)
		                              .attr("y", (y) * CELL_SIZE)
		                              .attr("width", CELL_SIZE - 2)
		                              .attr("height", CELL_SIZE - 2)
		                              .style("fill", 'black');
	},
	base: function (x, y, num) {
		y = this.height - y;
		return this.svg.append("rect").attr("x", (x) * CELL_SIZE)
		                              .attr("y", (y) * CELL_SIZE)
		                              .attr("width", CELL_SIZE - 2)
		                              .attr("height", CELL_SIZE - 2)
		                              .style("fill", Players.colors[num]);
	},
	enemy: function (x, y) {
		y = this.height - y;

		x = (x) * CELL_SIZE;
		y = (y) * CELL_SIZE;
		x = x - Math.random() * 10;
		y = y - Math.random() * 10;
		var points = (x + 11) + ',' + (y + 23) + ' ' + (x + 15) + ',' + (y + 10) + ' ' + (x + 25) + ',' + (y + 20) + ' ';

		return Area.svg.append('polygon').attr("points", points).style("fill", 'white')
		                                 .attr('stroke', 'red').style('stroke-width', 2);

	}
};

var Units = {
	units: {},
	unitsMeta: {},
	plazaList: {},
	blockList: {},
	enemyList: {},
	enemyDraw: [],
	maxX: undefined,
	maxY: undefined,
	renderAll: function () {

		Area.place();
		this.initMap();

		this.renderPlaza();
		Area.cursor();
		this.renderBlocks();
		this.renderUnits();

		this.renderEnemies();

	},

	renderPlaza: function () {
		Area.size(this.maxX, this.maxY);
		for (var i in this.plazaList) {
			Area.plaza(this.plazaList[i][0], this.plazaList[i][1]);
		}
	},
	renderBlocks: function () {
		for (var i in this.blockList) {
			Area.block(this.blockList[i][0], this.blockList[i][1]);
		}
	},
	renderEnemies: function () {

		for (var i = 0; i < this.enemyDraw.length; i++) {
			this.enemyDraw[i].remove();
		}
		this.enemyDraw = [];

		var Unit;
		for (var n in this.units) {
			Unit = this.units[n];

			for (i = 0; i < Unit.enemies.length; i++) {
				this.enemyDraw.push(Area.enemy(Unit.enemies[i][0], Unit.enemies[i][1]));
			}

		}
	},

	renderUnits: function () {
		var Unit;
		for (var i in this.units) {
			Unit = this.units[i];
			this.render(Unit);
		}
	},

	initMap: function () {
		var Unit, key;
		for (var i in this.units) {

			Unit = this.units[i];
			key = Unit.x + '.' + Unit.y;

			this.maxX = !this.maxX || this.maxX <= Unit.x ? Unit.x : this.maxX;
			this.maxY = !this.maxY || this.maxY <= Unit.y ? Unit.y : this.maxY;

			// свободное место на карте
			this.plazaList[key] = [Unit.x, Unit.y];

			// здесь будет сопутствующая информация
			this.unitsMeta[Unit.id] = Unit;

			this.initBlocks(Unit.blocks);
			this.initEnemies(Unit.enemies);

		}

	},

	initBlocks: function (blocks) {

		var key;

		for (var i = 0, qnt = blocks.length; i < qnt; i++) {
			key = blocks[i][0] + '.' + blocks[i][1];
			this.blockList[key] = [blocks[i][0], blocks[i][1]];
			this.maxX = !this.maxX || this.maxX <= blocks[i][0] ? blocks[i][0] : this.maxX;
			this.maxY = !this.maxY || this.maxY <= blocks[i][1] ? blocks[i][1] : this.maxY;
		}

	},

	initEnemies: function (enemies) {

		var key;

		for (var i = 0, qnt = enemies.length; i < qnt; i++) {
			key = enemies[i][0] + '.' + enemies[i][1];
			this.maxX = !this.maxX || this.maxX <= enemies[i][0] ? enemies[i][0] : this.maxX;
			this.maxY = !this.maxY || this.maxY <= enemies[i][1] ? enemies[i][1] : this.maxY;
		}

	},

	render: function (Unit) {

		var x = (Unit.x + 1) * CELL_SIZE - 5 - Math.random() * 10;
		var y = (Area.height - Unit.y + 1) * CELL_SIZE - 5 - Math.random() * 10;
		this.unitsMeta[Unit.id] = this.unitsMeta[Unit.id] || {};
		var Meta = this.unitsMeta[Unit.id];

		if (Meta.area) {
			Meta.area.remove();
		}

		Meta.area = Area.svg.append('circle')
				.style('fill', 'white')
				.style('stroke', 'green')
				.style('stroke-width', 2)
				.style('cursor', 'pointer')
				.attr('r', 8)
				.attr('unitId', Unit.id)
		;
		Meta.area.attr('cx', x).attr('cy', y).call(drag);

		if (Meta.$destroy) {
			Meta.area.style('opacity', 0.1);
			d3.select(Meta.area).on('drag', null);
			d3.select(Meta.area).remove();
		}

	},

	moveTo: function (Unit, direction) {
		client.move(Unit.id, direction, 'attack');


	},

	remove: function (id) {

		var Meta = this.unitsMeta[id];

		Meta.$destroy = true;
		d3.select(Meta.area).on('drag', null);
		Meta.area && d3.select(Meta.area).remove();
		delete this.units[id];
		delete this.unitsMeta[id];
		this.renderAll();

	}

};


var drag = d3.behavior.drag()
		.on("drag", function () {

			var M = d3.mouse(Area.svg.node());

			d3.select(this)
					.attr("cx", M[0])
					.attr("cy", M[1]);
			//var el = d3.select(this);
			//var Unit = Units.units[el.attr('unitId')];

			var x = Math.ceil(M[0] / CELL_SIZE) - 1;
			var y = Area.height - Math.ceil(M[1] / CELL_SIZE) + 1;

			Area.cursor(x, y);

		})
		.on("dragend", function () {
			var el = d3.select(this);
			var x = el.attr('cx');
			var y = el.attr('cy');
			var Unit = Units.units[el.attr('unitId')];
			if (!Unit) {
				return;
			}
			var Meta = Units.unitsMeta[Unit.id];

			x = Math.ceil(x / CELL_SIZE) - 1;
			y = Area.height - Math.ceil(y / CELL_SIZE) + 1;

			if (x < Unit.x && y == Unit.y) {
				Meta.moveTo = 'left';
			} else if (x > Unit.x && y == Unit.y) {
				Meta.moveTo = 'right';
			} else if (x == Unit.x && y < Unit.y) {
				Meta.moveTo = 'down';
			} else if (x == Unit.x && y > Unit.y) {
				Meta.moveTo = 'top';
			} else if (x < Unit.x && Unit.x - x > 2) {
				Meta.moveTo = 'left';
			} else if (x > Unit.x && x - Unit.x > 2) {
				Meta.moveTo = 'right';
			} else if (y > Unit.y && y - Unit.y > 2) {
				Meta.moveTo = 'top';
			} else if (y < Unit.y && Unit.y - y > 2) {
				Meta.moveTo = 'down';
			}

			Units.moveTo(Unit, Meta.moveTo);

			Area.cursor();

			console.log(Meta.moveTo);
			console.log(x + ';' + y);
			console.log(Unit);

		});

var client = new ClientConnect({

	name: 'mikanoz',

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
		Units.units[id] = position;
		console.log('ready unit [' + id + '] on ' + JSON.stringify(position));
		Units.renderAll();
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
		Units.remove(id);
		console.log('unit [' + id + '] is die :(');
	}

});