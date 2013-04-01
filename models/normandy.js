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
	embedLine : String,
	tweetText: String
})

//news articles
var newsArtsSchema = new Schema({
	headline : String,
	newsUrl : { type: String, required : true },
	bodyText : String,
	newstimePosted : String   
})

var userPostSchema = new Schema ({
	userName : String,
	userText : String,
	date : String
	
})

// define main article schema
var normandySchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	mainHeadline : { type: String, required : true }, 
	userPosts : [userPostSchema],
	lastupdated : { type: Date, default: Date.now },
	tweets :[tweetSchema],
	newsArticles : [newsArtsSchema]
});


// export 'normandy' model
module.exports = mongoose.model('normandy',normandySchema);