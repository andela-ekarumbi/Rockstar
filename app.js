// Set up required modules
var http = require('http'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	routes = require('./routes/routes'),
	mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://rockstar1:emkar2010@ds027835.mongolab.com:27835/rockstar');

// Set up body parsing
app.use(bodyParser.urlencoded({extended: false}));

// Set up routes
app.use('/', routes);

// Set up server
var port = process.env.PORT || 3000;

http.createServer(app).listen(port, function () {
	console.log('Server listening on port', port);
});