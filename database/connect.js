var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/maps');
var db = mongoose.connection;
db.on('error', function (err) {
	console.log('connection error: ' + err.message);
});
db.once('open', function callback() {
	console.log('Connected to DB!');
});

module.exports = mongoose;