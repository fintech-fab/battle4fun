var MapModel = require('../database/map.js');

/**
 * @param mapId карта
 * @param callback
 */
module.exports = function (mapId, callback) {

	MapModel.findById(mapId, function (err, item) {
		callback(item);
	});

};


