(function () {
	var request = require('request'),
		urlBase = 'http://127.0.0.1:3000/',
		sampleUsername = 'randUser' + (Math.floor(Math.random() * 100000)).toString(),
		sampleUser = {
			username: sampleUsername,
			password: 'holyS#*t!',
			firstName: 'Sample',
			lastName: 'User',
			age: 50,
			bio: 'We are Groot!',
			picUrl: 'http://lorempixel.com/640/480'
		},
		sampleSecurityToken;

	describe('Unit tests for Rockstar REST API: ', function () {

		// Test for base url

		it('GET / should return status code 200', function (done) {

			request.get(urlBase, function (error, response, body) {

				if (!error) {

					expect(response.statusCode).toBe(200);
					done();

				} else {
					throw error;
				}

			});

		});

		// Test for users POST method

		it('POST /api/users/add should add a user to the database and return a JSON' +
			' object containing the user that was added', function (done) {

				request.post({url: urlBase + 'api/users/add', form: sampleUser}, function (error, response, body) {

					if (!error) {

						expect(response.statusCode).toBe(201);

						if (typeof body === 'string')
							body = JSON.parse(body);

						expect(body.success).toBeTruthy();
						expect(body.user.username).toBe(sampleUsername);

						done();

					} else {
						throw error;
					}

				});
		});

		// Tests for users GET methods

		it('GET /api/users should return status code 200 and a JSON object containing' +
			' an array of users.', function (done) {

				request.get(urlBase + 'api/users', function (error, response, body) {

					if (!error) {

						expect(response.statusCode).toBe(200);

						if (typeof body === 'string')
							body = JSON.parse(body);

						expect(body.success).toBeTruthy();
						expect(Array.isArray(body.users)).toBeTruthy();

						done();

					}

				});
		});

		it('GET /api/users/{name} should return a JSON object containing the user ' +
			'whose usernamnpm request.poste is {name}.', function (done) {

				request.get(urlBase + 'api/users/' + sampleUsername, function (error, response, body) {

					if (!error) {

						expect(response.statusCode).toBe(200);

						if (typeof body === 'string')
							body = JSON.parse(body);

						expect(body.success).toBeTruthy();
						expect(body.user.username).toBe(sampleUsername);

						done();

					}

				});
		});

		// Test for authentication POST method

		it('POST /api/users/authenticate should return a JSON object containing' +
			' a security token, on successful authentication.', function (done) {

				request.post({url: urlBase + 'api/users/authenticate', form: sampleUser}, function (error, response, body) {

					if (!error) {

						expect(response.statusCode).toBe(200);

						if (typeof body === 'string')
							body = JSON.parse(body);

						expect(body.success).toBeTruthy();
						expect(body.token).toBeTruthy();

						sampleSecurityToken = body.token;

						done();

					} else {
						throw error;
					}

				});
		});

		// Test for users PUT method

		it('PUT /api/users/{name} should modify a user and return a JSON' +
			' object containing confirmation of a successful operation.', function (done) {

				var modifiedName = 'Kimende wa Kimendeeri',
					putUrl = urlBase + 'api/users/' + sampleUsername + '/?token=' + sampleSecurityToken;

				sampleUser.lastName = modifiedName;

				request.put({url: putUrl, form: sampleUser}, function (error, response, body) {

					if (!error) {

						expect(response.statusCode).toBe(200);

						if (typeof body === 'string')
							body = JSON.parse(body);

						expect(body.success).toBeTruthy();

						request.get(urlBase + 'api/users/' + sampleUsername, function (err, resp, bdy) {

							if (!err) {

								expect(resp.statusCode).toBe(200);

								if (typeof bdy === 'string')
									bdy = JSON.parse(bdy);

								expect(bdy.success).toBeTruthy();
								expect(bdy.user.lastName).toBe(modifiedName);
								expect(bdy.user.username).toBe(sampleUsername);

								done();

							} else {
								throw err;
							}

						});

					} else {
						throw error;
					}

				});
		});

		// Test for users DELETE Method

		it('DELETE /api/users/{name} should delete a user and return a JSON object' +
			' containing confirmation of a successful operation', function (done) {

				var delUrl = urlBase + 'api/users/' + sampleUsername + '/?token=' + sampleSecurityToken;

				request.del(delUrl, function (error, response, body) {

					if (!error) {

						expect(response.statusCode).toBe(200);

						console.log(body);

						if (typeof body === 'string')
							body = JSON.parse(body);

						expect(body.success).toBeTruthy();

						request.get(urlBase + 'api/users/' + sampleUsername, function (err, resp, bdy) {

							if (!err) {

								expect(resp.statusCode).toBe(200);

								if (typeof bdy === 'string')
									bdy = JSON.parse(bdy);

								expect(bdy.success).toBeFalsy();

								done();

							} else {
								throw err;
							}

						});

					} else {
						throw error;
					}

				});
		});

	});

})();