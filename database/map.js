var mongoose = require('./connect.js');

var MapSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true
	},
	area: {
		type: Object,
		required: true
	},
	bases: {
		type: Array,
		required: true
	},
	blocks: {
		type: Array,
		required: true
	}
});

module.exports = mongoose.model('Map', MapSchema);


