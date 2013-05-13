
/*
 * routes/index.js
 * 
 * Routes contains the functions (callbacks) associated with request urls.
 */
 
var request = require('request'); // library to request urls

var moment = require("moment"); // date manipulation library
var normandyModel = require("../models/normandy.js"); //db model

var Twit = require('twit');

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY
  , consumer_secret:      process.env.CONSUMER_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var nytAPI =  process.env.NYTIMES_CONSUMERAPIKEY;

var _ = require ('underscore'); //underscore.js
/*
//twitter authentication via passport
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;


passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "http://www.entwin.es/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));
*/

/*
	GET /
*/
exports.index = function(req, res) {
	
	console.log("main page requested");

	// query for all articles
	// .find will accept 3 arguments
	// 1) an object for filtering {} (empty here)
	// 2) a string of properties to be return, 'name slug source' will return only the name, slug and source returned main articles
	// 3) callback function with (err, results)
	//    err will include any error that occurred
	//	  allMains is our resulting array of articles
	normandyModel.find({}, 'mainHeadline slug lastupdated imageLink mainDescription', function(err, allMain){

		if (err) {
			res.send("Unable to query database for articles").status(500);
		};

		console.log("retrieved " + allMain.length + " articles from database");
		allMain.sort('-created');
		
		var templateData = {
			maines : allMain,
			pageTitle : "Main articles (" + allMain.length + ")"
		}

		res.render('index.html', templateData);
	});

}

exports.createFront = function(req, res){

	
	console.log("received form submission");
	console.log(req.body);
	
	//combine @ and # to form headline
	
	
//	var atplushash =  searchGovt + " + " + publicTweet ;
	

	// accept form post data
	var newMain = new normandyModel({
		
		mainHeadline : req.body.publicTweet,
		//atplushash : req.body.mainHeadline,
		//mainHeadline : req.body.mainHeadline,
		//mainDescription : req.body.mainDescription,
		//imageLink : req.body.imageLink,
		//googledNews : req.body.googledNews,
		publicTweet : req.body.publicTweet,
		searchGovt : req.body.searchGovt,
		slug : req.body.publicTweet.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});
	
	//newMain.googledNews = req.body.googledNews.split("+");
	newMain.publicTweet = req.body.publicTweet.split(",");
	newMain.searchGovt = req.body.searchGovt.split(",");
	//newMain.imageLink = req.body.imageLink.split(",");
	
	// save the newMainto the database
	newMain.save(function(err){
		if (err) {
			console.error("Error on saving new article");
			console.error(err); // log out to Terminal all errors

			var templateData = {
			//	page_title : 'Start a new article',
				errors : err.errors, 
				main : req.body
			};

			res.render('create_form.html', templateData);
			// return res.send("There was an error when creating a new article");

		} else {
			console.log("Created a new article!");
			console.log(newMain);
			
			// redirect to the astronaut's page
			res.redirect('/main/'+ newMain.slug)
		}
	});
};

/*
	GET /main/:main_id
*/
exports.detail = function(req, res) {

	console.log("detail page requested for " + req.params.main_id);

	//get the requested main by the param on the url :main_id
	var main_id = req.params.main_id;

	// query the database for articles
	var mainQuery = normandyModel.findOne({slug:main_id});
	mainQuery.exec(function(err, currentMain){

		if (err) {
			return res.status(500).send("There was an error on the query. The Twitter account may not exist.");
		}

		if (currentMain == null) {
			return res.status(404).render('404.html');
		}

		console.log("Found article");
		console.log(currentMain.mainHeadline);

		//query for all articles, return only name and slug
		normandyModel.find({}, 'mainHeadline slug', function(err, allMain){

			console.log("retrieved all articles : " + allMain.length);
			
			//Search the NYT for articles
			
			var nytURL = 'http://api.nytimes.com/svc/search/v1/article?query=';
			
			//insert search paramaters
    		var newsSearch = nytURL + [currentMain.publicTweet] + '&api-key=' + nytAPI; 
    		
    		request.get(newsSearch, function(error, response, nData){

	    		if (error){
		    		res.send("There was an error requesting remote api.");
		    	}
		    
		    	var newsData = JSON.parse(nData);
		    	
		    	var displayNews = _.initial(newsData.results,[7]);
		    	
		    	//console.log(displayNews);
		    /*			    			    	
			    newsData.results.date = function() {
					return moment(this.results.date).format("MM-DD-YYYY");
					}
					console.log(newsData.results.date);			
			*/		
						
			//This uses the twit library for nodejs    		
    		T.get('search/tweets', { q: [currentMain.publicTweet] , include_entities: 'true' }, function(err, data) {
    		
	    		if (err){
		    		res.send("There was an error requesting remote api.");
		    	}
		    	// uses underscore.js to unpack the objects within the Twitter API
		    	//var dataEntities = _.pluck(data.statuses, "entities");
			  			    	
		    	//var dataUrls = _.pluck(dataEntities, "urls");
		    	//console.log(dataUrls);
		    //	var dataImages = _.pluck(dataEntities, "media");
		    //	console.log(dataImages);
		    	/*
		    data.exec(function parseLinks(tweet) {
			    return tweet.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(tweet) {
				    return tweet.link(tweet);
				    console.log(tweet);
				    	});
				};	
		    	*/
			T.get('statuses/user_timeline', { screen_name: [currentMain.searchGovt]  }, function(err, gdata) {
			
				if (err){
		    		res.send("There was an error requesting remote api.");
		      	}
		      	
		      	//var gEntities = _.pluck(gdata, "entities");
		      	//var gLinks = _.pluck(gEntities, "urls");
		      	
		    // 	console.log (gLinks);
		      	
		      	//var gImages = _.pluck(gEntities, "media");
		      	//console.log(gImages.media_url);
		      //	console.log("************")
		      //	console.log(data.statuses[0].entities);
		    		
			//prepare template data for view
			var templateData = {
			//	newsD : newsShow.results,
				newsD: displayNews,
				govtF : gdata,
				//govLinks : gEntities.gLinks,
				//govImages : gImages,
				publicT : data.statuses,
				//publicUrl :dataEntities.dataUrls,
			//	imageLink : dataImages,
				main : currentMain,
				maines : allMain,
				rawJSON : data, 
				pageTitle : currentMain.mainHeadline
			};

			// render and return the template
			res.render('detail.html', templateData);
						
					}) //end of nyt search
				}) //end of twitter keyword search
			}) //end of twitter user search
		}) // end of .find (all) query
		
	}); // end of .findOne query

}

	//GET /create
exports.mainForm = function(req, res){

	var templateData = {
		page_title : 'Add a new article'
	};

	res.render('create_form.html', templateData);
}

	//POST /create
exports.createMain = function(req, res) {
	
	console.log("received form submission");
	console.log(req.body);

	// accept form post data
	var newMain = new normandyModel({
		mainHeadline : req.body.mainHeadline,
		mainDescription : req.body.mainDescription,
		imageLink : req.body.imageLink,
		googledNews : req.body.googledNews,
		publicTweet : req.body.publicTweet,
		searchGovt : req.body.searchGovt,
		slug : req.body.mainHeadline.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});
	
	newMain.googledNews = req.body.googledNews.split("+");
	newMain.publicTweet = req.body.publicTweet.split(",");
	newMain.searchGovt = req.body.searchGovt.split(",");
	newMain.imageLink = req.body.imageLink.split(",");
	
	// save the newMainto the database
	newMain.save(function(err){
		if (err) {
			console.error("Error on saving new article");
			console.error(err); // log out to Terminal all errors

			var templateData = {
				page_title : 'Start a new article',
				errors : err.errors, 
				main : req.body
			};

			res.render('create_form.html', templateData);
			// return res.send("There was an error when creating a new article");

		} else {
			console.log("Created a new article!");
			console.log(newMain);
			
			// redirect to the astronaut's page
			res.redirect('/main/'+ newMain.slug)
		}
	});
};

exports.editMainForm = function(req, res) {

	// Get article from URL params
	var main_id = req.params.main_id;
	var mainQuery = normandyModel.findOne({slug:main_id});
	mainQuery.exec(function(err, mains){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ main_id).status(500);
		}

		if (mains != null) {

			// birthdateForm function for edit form
			// html input type=date needs YYYY-MM-DD format
			/*astronaut.birthdateForm = function() {
					return moment(this.birthdate).format("YYYY-MM-DD");
			}*/

			// prepare template data
			var templateData = {
				main : mains
			};

			// render template
			res.render('edit_form.html',templateData);

		} else {

			console.log("unable to find article: " + main_id);
			return res.status(404).render('404.html');
		}

	})

}

exports.updateMain = function(req, res) {

	// Get article from URL params
	var main_id = req.params.main_id;

	// prepare form data
	var updatedData = {
	/*	mainHeadline : req.body.mainHeadline,
		mainDescription : req.body.mainDescription,
		imageLink : req.body.imageLink.split(","),
		googledNews : req.body.googledNews.split("+"),*/
		publicTweet : req.body.publicTweet.split(","),
		searchGovt : req.body.searchGovt.split(",")	
	//	slug : req.body.mainHeadline.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')
	}

	// query for article
	normandyModel.update({slug:main_id}, { $set: updatedData}, function(err, main){

		if (err) {
			console.error("ERROR: While updating");
			console.error(err);			
		}

		if (main != null) {
			res.redirect('/main/' + main_id);

		} else {

			// unable to find article, return 404
			console.error("unable to find article: " + main_id);
			return res.status(404).render('404.html');
		}
	})
}


// user post comments
exports.savePost = function(req, res) {

	// Get articles from URL params
	var main_id = req.params.main_id;

	// query database for article
	normandyModel.findOne({slug:main_id}, function(err, main){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ main_id).status(500);
		}
		
		if (req.body.selected1) {
		savedPair.choice1.selected1 = true;
		}

		if (main != null) {
			
			// add a new post
			var savedPair = {
				date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				choice1 :{
			//		selected1 : Boolean,
					user1 	: req.body.user1,
					text1	: req.body.text1,
					tURL1 	: req.body.tURL1,
					e1URL	: req.body.e1URL,
					thumb1 	: req.body.thumb1
				},
				choice2 :{
				//	selected2 : Boolean,
					user2 	: req.body.user2,
					text2	: req.body.text2,
					tURL2 	: req.body.tURL2,
					e2URL	: req.body.e2URL,
					thumb2 	: req.body.thumb2
				},
			};

			console.log("new saved post");
			console.log(savedPair);

			main.savedPosts.push(savedPair);
			main.save(function(err){
				if (err) {
					console.error(err);
					res.send(err.message);
				}
			});

			res.redirect('/main/' + main_id);


		} else {

			// unable to find article, return 404
			console.error("unable to find main: " + main_id);
			return res.status(404).render('404.html');
		}
	})
}


// user post comments
exports.postUser = function(req, res) {

	// Get articles from URL params
	var main_id = req.params.main_id;

	// query database for article
	normandyModel.findOne({slug:main_id}, function(err, main){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ main_id).status(500);
		}

		if (main != null) {
			
			// add a new post
			var uPost = {
			//	date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				userName : req.body.userName,
				userText : req.body.userText
			};

			console.log("new user post");
			console.log(uPost);

			main.userPosts.push(uPost);
			main.save(function(err){
				if (err) {
					console.error(err);
					res.send(err.message);
				}
			});

			res.redirect('/main/' + main_id);


		} else {

			// unable to find article, return 404
			console.error("unable to find main: " + main_id);
			return res.status(404).render('404.html');
		}
	})
}

exports.deleteMain = function(req,res) {

	// Get headline from URL params
	var main_id = req.params.main_id;

	// if querystring has confirm=yes, delete record
	// else display the confirm page

	if (req.query.confirm == 'yes')  {
	
		normandyModel.remove({slug:main_id}, function(err){
			if (err){ 
				console.error(err);
				res.send("Error when trying to remove main: "+ main_id);
			}

			res.send("Removed article. <a href='/'>Back to home</a>.");
		});

	} else {
		//query main article and display confirm page
		normandyModel.findOne({slug:main_id}, function(err, mains){

			if (err) {
				console.error("ERROR");
				console.error(err);
				res.send("There was an error querying for "+ main_id).status(500);
			}

			if (mains != null) {

				var templateData = {
					main : mains
				};
				
				res.render('delete_confirm.html', templateData);
			
			}
		})
	}
}

// exporting data to JSON
exports.data_all = function(req, res) {

    // query for all articles
    mainQuery = normandyModel.find({}); // query for all articles
    mainQuery.sort('-lastupdated');
    mainQuery.exec(function(err, allMains){

        // prepare data for JSON
        var jsonData = {
            status : 'OK',
            mains : allMains
        }

        // send JSON to requestor
        res.json(jsonData);
    });
}

exports.about = function(req,res){
	
	res.render('about.html');
	
	
	}
