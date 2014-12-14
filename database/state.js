var mongoose = require('./connect.js');

var StateSchema = new mongoose.Schema({
	gameId: {
		type: String,
		required: true,
		index: true
	},
	playerId: {
		type: Number,
		required: true
	},
	unitId: {
		type: Number,
		required: true
	},
	position: {
		x: {
			type: Number,
			required: true
		},
		y: {
			type: Number,
			required: true
		}
	},
	command: {
		type: String,
		required: true
	},
	mode: {
		type: String,
		required: true
	},
	result: {
		type: String
	},
	step: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('State', StateSchema);
