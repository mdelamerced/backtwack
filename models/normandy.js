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

// tweets
var tweetSchema = new Schema({
	username : { String,required: true },
	timePost: String,
	verifiedAccount: Boolean,
	embedLine : String,
})

// related tweets
var relatedTweets = new Schema({
	tweets : [tweetSchema],
	
})

// news articles
var newsArts = new Schema({
	headline : String,
	newsUrl : { String, required : true },
	bodyText : String,
	newstimePosted : String,
})

// related news articles
var relnewsArticles = new Schema ({
	relnewsArts : [newsArts],
})

// define main article schema
var normandySchema = new Schema({
	slug : {type: String, lowercase: true, required: true, unique: true },
	mainHeadline : String, 
	userPost : {
		userName : String,
		userText : String,
	},
	relatednewsArts : [newsArts],
	relatedTweets : [tweetSchema],
    lastupdated : { type: Date, default: Date.now }
});


// export 'normandy' model
module.exports = mongoose.model('normandy',normandySchema);