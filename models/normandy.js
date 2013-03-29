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

//tweets
var tweetSchema = new Schema({
	tweetname : { type: String, required: true },
	timePost: String,
	VerifiedAccount: Boolean,
	embedLine : String
})

//news articles
var newsArts = new Schema({
	headline : String,
	newsUrl : { type: String, required : true },
	bodyText : String,
	newstimePosted : String   
})

var userPost = new Schema ({
	userName : String,
	userText : String
	
})

// define main article schema
var normandySchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	mainHeadline : { type: String, required : true }, 
	userPosts : [userPost],
	lastupdated : { type: Date, default: Date.now },
	tweets :[tweetSchema],
	newsArticles : [newsArts]
});


// export 'normandy' model
module.exports = mongoose.model('normandy',normandySchema);