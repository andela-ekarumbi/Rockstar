var mongoose = require('mongoose'),
	UserSchema = mongoose.Schema({
		username: String,
		password: String,
		firstName: String,
		lastName: String,
		age: Number,
		bio: String,
		picUrl: String
	}),
	User = mongoose.model('User', UserSchema);

module.exports = User;
