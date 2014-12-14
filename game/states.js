var StateModel = require('../database/state.js');

/**
 * @param gameId игра
 * @param callback
 */
module.exports = function (gameId, callback) {

	StateModel.find({gameId: gameId}, function (err, items) {
		callback(items);
	});

};



