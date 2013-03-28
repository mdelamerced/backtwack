
/*
 * routes/index.js
 * 
 * Routes contains the functions (callbacks) associated with request urls.
 */

var moment = require("moment"); // date manipulation library
var normandyModel = require("../models/normandy.js"); //db model


/*
	GET /
*/
exports.index = function(req, res) {
	
	console.log("main page requested");

	// query for all astronauts
	// .find will accept 3 arguments
	// 1) an object for filtering {} (empty here)
	// 2) a string of properties to be return, 'name slug source' will return only the name, slug and source returned main articles
	// 3) callback function with (err, results)
	//    err will include any error that occurred
	//	  allAstros is our resulting array of astronauts
	normandyModel.find({}, 'name slug source', function(err, allMains){

		if (err) {
			res.send("Unable to query database for articles").status(500);
		};

		console.log("retrieved " + allMains.length + " articles from database");

		var templateData = {
			mains : allMains,
			pageTitle : "Main articles (" + allMains.length + ")"
		}

		res.render('index.html', templateData);
	});

}

/*
	GET /main/:main_id
*/
exports.detail = function(req, res) {

	console.log("detail page requested for " + req.params.main_id);

	//get the requested main by the param on the url :astro_id
	var main_id = req.params.main_id;

	// query the database for astronaut
	var mainQuery = normandyModel.findOne({slug:main_id});
	mainQuery.exec(function(err, currentMain){

		if (err) {
			return res.status(500).send("There was an error on the query");
		}

		if (currentMain == null) {
			return res.status(404).render('404.html');
		}

		console.log("Found article");
		console.log(currentMain.mainHeadline);

		// formattedBirthdate function for currentAstronaut
	/*	currentMain.formattedBirthdate = function() {
			// formatting a JS date with moment
			// http://momentjs.com/docs/#/displaying/format/
            return moment(this.birthdate).format("dddd, MMMM Do YYYY");
        };
		*/
		//query for all astronauts, return only name and slug
		normandyModel.find({}, 'name slug', function(err, allMain){

			console.log("retrieved all articles : " + allMain.length);

			//prepare template data for view
			var templateData = {
				main : currentMain,
				mains : allMain,
				pageTitle : currentMain.mainHeadline
			}

			// render and return the template
			res.render('detail.html', templateData);


		}) // end of .find (all) query
		
	}); // end of .findOne query

}

/*
	GET /create
*/
exports.mainForm = function(req, res){

	var templateData = {
		page_title : 'Add a new article'
	};

	res.render('create_form.html', templateData);
}

/*
	POST /create
*/
exports.createMain = function(req, res) {
	
	console.log("received form submission");
	console.log(req.body);

	// accept form post data
	var newMain = new normandyModel({
		mainHeadline : req.body.mainHeadline,
		slug : req.body.mainHeadline.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});
	// boolean checkbox
/*	if (req.body.walkedonmoon) {
		newAstro.walkedOnMoon = true;
	}
	*/
	// save the newAstro to the database
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
			// return res.send("There was an error when creating a new astronaut");

		} else {
			console.log("Created a new article!");
			console.log(newMain);
			
			// redirect to the astronaut's page
			res.redirect('/main/'+ newMain.slug)
		}
	});
};

exports.editMainForm = function(req, res) {

	// Get astronaut from URL params
	var main_id = req.params.main_id;
	var mainQuery = normandyModel.findOne({slug:main_id});
	mainQuery.exec(function(err, main){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ main_id).status(500);
		}

		if (main != null) {

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
		mainHeadline : req.body.mainHeadline,		
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

//post new tweet embed
exports.postNews = function(req, res) {

	// Get astronaut from URL params
	var main_id = req.params.main_id;

	// query database for article
	normandyModel.findOne({slug:main_id}, function(err, main){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ main_id).status(500);
		}

		if (main != null) {

			// found the article

			// concatenate submitted date field + time field
			var datetimestr = req.body.logdate + " " + req.body.logtime;

			console.log(datetimestr);
			
			// add a new tweet
			var news = {
				date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				headline : req.body.headline,
				newsUrl : req.body.newsUrl,
				bodyText : req.body.bodyText
			};

			console.log("new news!");
			console.log(news);

			main.newsArticles.push(news);
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

//post tweet
exports.postTweet = function(req, res) {

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

			// found the article

			// concatenate submitted date field + time field
			var datetimestr = req.body.logdate + " " + req.body.logtime;

			console.log(datetimestr);
			
			// add a new tweet
			var tweet = {
				date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				tweetname : req.body.tweetname,
				embedLine : req.body.embedLine,
			};

			console.log("new tweet");
			console.log(tweet);

			main.tweets.push(tweet);
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


//post user
exports.userPost = function(req, res) {

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

			// found the article

			// concatenate submitted date field + time field
			var datetimestr = req.body.logdate + " " + req.body.logtime;

			console.log(datetimestr);
			
			// add a new tweet
			var user = {
				date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				userName : req.body.username,
				userText : req.body.userText
			};

			console.log("new tweet");
			console.log(tweet);

			main.tweets.push(tweet);
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

	// Get astronaut from URL params
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
		normandyModel.findOne({slug:main_id}, function(err, main){

			if (err) {
				console.error("ERROR");
				console.error(err);
				res.send("There was an error querying for "+ main_id).status(500);
			}

			if (main != null) {

				var templateData = {
					main : mains
				};
				
				res.render('delete_confirm.html', templateData);
			
			}
		})

	}


}
