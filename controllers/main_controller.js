// Required 

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	jwt = require('jsonwebtoken'),
	bcrypt = require('bcryptjs'),
	secret = 'Holy s#*t!!',
	User = require('../models/user'),
	Member = require('../models/member');

// Controller object

var controller = {};


app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

// NB: the actual routing happens in routes.js, the 'route'-containing names are just used
// for purposes of clarity.

// Router for protected API routes (only the PUT and DELETE routes will be protected,
// the rest will be open).

controller.protectedRoutes = express.Router();

// Route middleware for token authentication

controller.protectedRoutes.use(function (request, response, next) {

	// For simplicity, the security token should be appended as a query string 
	// variable, even when the request is a POST, PUT or DELETE.

	var token = request.query.token;

	if (token) {

		jwt.verify(token, secret, function (error, decodedToken) {

			if (error) { // token authentication failed

				response.json({
					success: false,
					message: 'Token authentication failed'
				});

			} else {

				request.decodedToken = decodedToken;
				next();
			}

		});

	} else { // token was not provided

		response.json({
			success: false,
			message: 'Token was not provided'
		});
	}

});

// PUT route for modifying users

controller.protectedRoutes.put('/:name?', function (request, response) {

	var body = request.body,
		name = request.params.name,
		token = request.decodedToken;

	// Verify that the user being modified is the one named as the audience
	// in the security token.

	if (token.aud === name) {

		// Define query

		var query = User.update({'username': name}, {
				username: body.username,
				firstName: body.firstName,
				lastName: body.lastName,
				age: body.age,
				bio: body.bio,
				picUrl: body.picUrl
		});

		// Execute query

		query.exec(function (error, numAffected) {

			if (!error) { // query executed successfully

				response.status(200).json({
					success: true,
					user: body,
					message: 'User ' + name + ' modified successfully'
				});

			} else {

				response.status(404).json({
					success: false,
					message: 'User ' + name + ' not found'
				});

			}

		});
		

	} else {

		response.json({
			success: false,
			message: 'You are not allowed to modify this user'
		});

	}

});

// DELETE route for deleting users
controller.protectedRoutes.delete('/:name?', function (request, response) {

	var username = request.params.name,
		token = request.decodedToken;

	// Verify that the user being deleted is the one named as the audience
	// in the security token.

	if (token.aud === username) {
		
		// Define query

		var query = User.remove({'username': username});

		// Execute query

		query.exec(function (error, result) {

			if (!error) {

				// Declare and execute second query

				var query2 = Member.remove({'username': username});

				query2.exec(function (err, res) {

					if (!err) {

						response.status(200).json({
							success: true,
							message: 'User ' + username + ' deleted successfully'
						});

					}

				})

			} else {

				response.status(404).json({
					success: false,
					message: 'User ' + username + ' not found'
				});
			}
		});

	} else {

		response.json({
			success: false,
			message: 'You are not allowed to delete this user',
			token: token
		});

	}

});

// Open routes

// GET route for all users
controller.getUserRoute = function (request, response) {
	
	// Declare query

	var query = User.findOne({'username': request.params.name});

	// Execute query

	query.exec(function (error, user) {

		if (!error && user && user.username) {

			response.status(200).json({
				success: true,
				user: user
			});

		} else {

			response.json({
				success: false,
				message: 'User not found in database'
			});

		}

	});
	
};

// GET route for specific user
controller.getAllRoute = function (request, response) {
	
	// Declare query

	var query = User.find({});

	// Excecute query

	query.exec(function (error, users) {

		if (!error && users && users.length > 0) {

			response.status(200).json({
				success: true,
				users: users
			});

		} else {

			response.json({
				success: false,
				message: 'Users database is empty'
			});

		}

	});

};

// POST route for adding users
controller.userAddRoute = function (request, response) {
	var body = request.body,
		salt = bcrypt.genSaltSync(10);

	// Check if user exists

	var query = User.findOne({'username': body.username});

	query.exec(function (error, user) {

		if (!error && (!user || !user.username)) { // user does not exist, proceed to create

			// Prepare password hash
			var passwordHash = bcrypt.hashSync(body.password, salt);

			// Models to be saved to database

			var user = new User({
				username: body.username,
				firstName: body.firstName,
				lastName: body.lastName,
				age: body.age,
				bio: body.bio,
				picUrl: body.picUrl
			});

			var member = new Member({
				username: body.username,
				passwordHash: passwordHash,
				passwordSalt: salt
			});

			// Save models to database
			user.save(function (error) {

				if (!error) {
					member.save(function (err) {

						if (!err) {

							response.status(201).json({
								success: true,
								user: user,
								message: 'User ' + body.username + ' added successfully'
							});

						}

					});
				}

			});

		} else {

			response.json({
				success: false,
				message: 'User ' + body.username + ' already exists in the database'
			});

		}

	});
	
};

// POST route for authentication
controller.authRoute = function (request, response) {

	var username = request.body.username,
		password = request.body.password;

	// Retrieve member object for testing

	var query = Member.findOne({'username': username});

	query.exec(function (error, member) {

		if (!error && member.username) {

			var testHash = member.passwordHash,
				testSalt = member.passwordSalt,
				passwordHash = bcrypt.hashSync(password, testSalt);

			if (testHash === passwordHash) {

				var token = jwt.sign({}, secret, {
					expiresIn: 1200,
					audience: username
				});

				response.status(200).json({
					success: true,
					message: 'Authentication successful',
					token: token
				});

			} else {

				response.json({ 
					success: false,
					message: 'Authentication failed. Wrong password.'
				});

			}

		} else {

			response.json({
				 success: false, 
				 message: 'Authentication failed. User not found.' 
			});
		}

	});
	
};

// Test route
controller.testRoute = function (request, response) {
	var name = request.params.name || 'Stranger';
	response.send('Hello, ' + name + '!');
};

// Export routes

module.exports = controller;