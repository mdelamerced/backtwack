var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// validation function
var nameValidation = function(val) {
	console.log("inside name validation");
	console.log(val);
	
	if (val.length >= 5) {
		return true;
	} else {
		return false;
	}
}

// user posts
var userPostSchema = new Schema ({
	userName : { type: String, required :true },
	userText : { type: String, required :true },
	date : Date
	
})

// define main article schema
var normandySchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	mainHeadline : { type: String, required : true }, 
	mainDescription : String,
	imageLink : [String],
	lastupdated : { type: Date, default: Date.now },
	googledNews :[String],
	publicTweet :[String],
	publicUrl : [String],
	searchGovt : [String],
	userPosts : [userPostSchema]
});


// export 'normandy' model
module.exports = mongoose.model('normandy',normandySchema);