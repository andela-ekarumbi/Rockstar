var mongoose = require('mongoose'),
	MemberSchema = mongoose.Schema({
		username: String,
		passwordHash: String,
		passwordSalt: String
	})
	Member = mongoose.model('Member', MemberSchema);

module.exports = Member;