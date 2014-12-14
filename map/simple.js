var defer = require("node-promise").defer;
var deferred = defer();
var MapModel = require('../database/map.js');

var map = {
	area: {
		height: 20,
		width: 20
	},
	bases: [
		[3, 3], [3, 18], [18, 3], [18, 18]
	],
	blocks: [
		[3, 13], [4, 13], [5, 13], [6, 13],
		[3, 12], [4, 12], [5, 12], [6, 12],
		[11, 11], [11, 12], [11, 13], [11, 14], [11, 15],
		[12, 11], [12, 12], [12, 13], [12, 14], [12, 15],
		[11, 3], [12, 3], [13, 3], [14, 3],
		[11, 4], [12, 4], [13, 4], [14, 4]
	]
};

module.exports = function (force) {

	MapModel.findById('simple', function (err, item) {

		if (!force && item) {
			console.log('fetch map named [simple] [' + err + ']');
			deferred.resolve(item);
			return;
		}


		if (!item) {
			map._id = 'simple';
			item = new MapModel(map);
			item.save(function (err) {
				console.log('create new map named [simple] [' + err + ']');
				deferred.resolve(item);
			});
		} else {
			MapModel.update({_id: 'simple'}, map, function (err) {
				console.log('update map named [simple] [' + err + ']');
				MapModel.findById('simple', function (err, item) {
					console.log('reload map named [simple] [' + err + ']');
					deferred.resolve(item);
				});
			});
		}

	});

	return deferred.promise;
};





