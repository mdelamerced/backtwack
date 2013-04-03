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
	tweetname : String,
	timePost: String,
	VerifiedAccount: Boolean,
	embedLine : { type: String, required: true },
	tweetText: String
})

//news articles
var newsArtsSchema = new Schema({
	headline : String,
	newsUrl : { type: String, required : true },
	bodyText : String,
	newstimePosted : String   
})

// user posts
var userPostSchema = new Schema ({
	userName : String,
	userText : String,
	date : String
	
})

// define main article schema
var normandySchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	mainHeadline : { type: String, required : true }, 
	mainDescription : String,
	imageLink : String,
	userPosts : [userPostSchema],
	lastupdated : { type: Date, default: Date.now },
	tweets :[tweetSchema],
	newsArticles : [newsArtsSchema]
});


// export 'normandy' model
module.exports = mongoose.model('normandy',normandySchema);