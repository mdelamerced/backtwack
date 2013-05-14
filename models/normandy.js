var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// validation function
var nameValidation = function(val) {
	console.log("inside name validation");
	console.log(val);
	
	if  (/[^a-zA-Z0-9]/.test(val)) {
		console.log("We'll add the special characters for you");
		return false;
	} else {
		return true;
	}
}

// user posts
var userPostSchema = new Schema ({
	userName : { type: String, required :true },
	userText : { type: String, required :true },
	date : Date
	
})

// saved posts

var savePostSchema = new Schema ({
	date: Date,
	choice1 : { 
		selected1 : Boolean,
		user1 	: String,
		text1	: String,
		tURL1 	: String,
		e1URL	: String,
		thumb1 	: String
	},
	
	choice2 : {
		selected2 : Boolean,
		user2 	: String,
		text2	: String,
		tURL2 	: String,
		e2URL	: String,
		thumb2 	: String
	}
})

// define main article schema
var normandySchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	mainHeadline : { type: String, required : true}, 
	mainDescription : String,
	imageLink : [String],
	lastupdated : { type: Date, default: Date.now },
	googledNews :[String],
	publicTweet :{ type :[String],
				   required : true,
				   validate: [nameValidation, 'Alphanumeric characters only']
				  },
					 
	publicUrl : [String],
	searchGovt : { type :[String],
				   required : true,
				   validate: [nameValidation, 'Alphanumeric characters only']
				  },
				  
	userPosts : [userPostSchema],
	savedPosts : [savePostSchema]
});


// export 'normandy' model
module.exports = mongoose.model('normandy',normandySchema);