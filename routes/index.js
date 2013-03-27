
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
	// 2) a string of properties to be return, 'name slug source' will return only the name, slug and source returned astronauts
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
	GET /astronauts/:astro_id
*/
exports.detail = function(req, res) {

	console.log("detail page requested for " + req.params.main_id);

	//get the requested astronaut by the param on the url :astro_id
	var main_id = req.params.main_id;

	// query the database for astronaut
	var astroQuery = normandyModel.findOne({slug:main_id});
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

			console.log("retrieved all astronauts : " + allMain.length);

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
	var newAstro = new normandyModel({
		name : req.body.name,
		photo : req.body.photoUrl,
		source : {
			name : req.body.source_name,
			url : req.body.source_url
		},
		slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});

	// you can also add properties with the . (dot) notation
	if (req.body.birthdate) {
		newAstro.birthdate = moment(req.body.birthdate).toDate();
	}

	newAstro.skills = req.body.skills.split(",");

	// walked on moon checkbox
	if (req.body.walkedonmoon) {
		newAstro.walkedOnMoon = true;
	}
	
	// save the newAstro to the database
	newAstro.save(function(err){
		if (err) {
			console.error("Error on saving new astronaut");
			console.error(err); // log out to Terminal all errors

			var templateData = {
				page_title : 'Enlist a new astronaut',
				errors : err.errors, 
				astro : req.body
			};

			res.render('create_form.html', templateData);
			// return res.send("There was an error when creating a new astronaut");

		} else {
			console.log("Created a new astronaut!");
			console.log(newAstro);
			
			// redirect to the astronaut's page
			res.redirect('/astronauts/'+ newAstro.slug)
		}
	});
};

exports.editAstroForm = function(req, res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;
	var astroQuery = normandyModel.findOne({slug:astro_id});
	astroQuery.exec(function(err, astronaut){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ astro_id).status(500);
		}

		if (astronaut != null) {

			// birthdateForm function for edit form
			// html input type=date needs YYYY-MM-DD format
			astronaut.birthdateForm = function() {
					return moment(this.birthdate).format("YYYY-MM-DD");
			}

			// prepare template data
			var templateData = {
				astro : astronaut
			};

			// render template
			res.render('edit_form.html',templateData);

		} else {

			console.log("unable to find astronaut: " + astro_id);
			return res.status(404).render('404.html');
		}

	})

}

exports.updateAstro = function(req, res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;

	// prepare form data
	var updatedData = {
		name : req.body.name,
		photo : req.body.photoUrl,
		source : {
			name : req.body.source_name,
			url : req.body.source_url
		},
		birthdate : moment(req.body.birthdate).toDate(),
		skills : req.body.skills.split(","),

		walkedOnMoon : (req.body.walkedonmoon) ? true : false
		
	}


	// query for astronaut
	astronautModel.update({slug:astro_id}, { $set: updatedData}, function(err, astronaut){

		if (err) {
			console.error("ERROR: While updating");
			console.error(err);			
		}

		if (astronaut != null) {
			res.redirect('/astronauts/' + astro_id);

		} else {

			// unable to find astronaut, return 404
			console.error("unable to find astronaut: " + astro_id);
			return res.status(404).render('404.html');
		}
	})
}

exports.postShipLog = function(req, res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;

	// query database for astronaut
	astronautModel.findOne({slug:astro_id}, function(err, astronaut){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ astro_id).status(500);
		}

		if (astronaut != null) {

			// found the astronaut

			// concatenate submitted date field + time field
			var datetimestr = req.body.logdate + " " + req.body.logtime;

			console.log(datetimestr);
			
			// add a new shiplog
			var logData = {
				date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				content : req.body.logcontent
			};

			console.log("new ship log");
			console.log(logData);

			astronaut.shiplogs.push(logData);
			astronaut.save(function(err){
				if (err) {
					console.error(err);
					res.send(err.message);
				}
			});

			res.redirect('/astronauts/' + astro_id);


		} else {

			// unable to find astronaut, return 404
			console.error("unable to find astronaut: " + astro_id);
			return res.status(404).render('404.html');
		}
	})
}

exports.deleteAstro = function(req,res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;

	// if querystring has confirm=yes, delete record
	// else display the confirm page

	if (req.query.confirm == 'yes')  {
	
		normandyModel.remove({slug:astro_id}, function(err){
			if (err){ 
				console.error(err);
				res.send("Error when trying to remove astronaut: "+ astro_id);
			}

			res.send("Removed astronaut. <a href='/'>Back to home</a>.");
		});

	} else {
		//query astronaut and display confirm page
		normandyModel.findOne({slug:astro_id}, function(err, astronaut){

			if (err) {
				console.error("ERROR");
				console.error(err);
				res.send("There was an error querying for "+ astro_id).status(500);
			}

			if (astronaut != null) {

				var templateData = {
					astro : astronaut
				};
				
				res.render('delete_confirm.html', templateData);
			
			}
		})

	}


}
