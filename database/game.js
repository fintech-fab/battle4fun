var mongoose = require('./connect.js');

module.exports = function (mapId) {

};

var GameSchema = new mongoose.Schema({
	mapId: {
		type: String,
		required: true
	},
	players: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	}
});

module.exports = mongoose.model('Game', GameSchema);
