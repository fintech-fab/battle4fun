var GameModel = require('../database/game.js');

/**
 * @param gameId игра
 * @param callback
 */
module.exports = function (gameId, callback) {

	GameModel.findById(gameId, function (err, item) {
		callback(item);
	});

};





