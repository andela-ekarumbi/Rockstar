var express = require('express'),
	router = express.Router(),
	controller = require('../controllers/main_controller');

// Define route table

router.get('/', function (request, response) {
	response.send('Path to API: /api/users');
});
router.get('/api/test', controller.testRoute);
router.get('/api/users/', controller.getAllRoute);
router.get('/api/users/:name?', controller.getUserRoute);
router.post('/api/users/add', controller.userAddRoute);
router.post('/api/users/authenticate', controller.authRoute);
router.use('/api/users', controller.protectedRoutes);

// Export route table

module.exports = router;