
/*
 * routes/index.js
 * 
 * Routes contains the functions (callbacks) associated with request urls.
 */

var moment = require("moment"); // date manipulation library
var citadelModel = require("../models/citadel.js"); //db model


/*
	GET /
*/
exports.index = function(req, res) {
	
	console.log("main page requested");

	citadelModel.find({}, 'headline slug source', function(err, allResearch){

		if (err) {
			res.send("Unable to query database for topics").status(500);
		};

		console.log("retrieved " + allResearch.length + " available research from database");

		var templateData = {
			research : allResearch,
			pageTitle : "Available research topics (" + allResearch.length + ")"
		}

		res.render('index.html', templateData);
	});

}

/*
	GET /research/:research_id
*/
exports.detail = function(req, res) {

	console.log("detail page requested for " + req.params.research_id);

	//get the requested research by the param on the url :research_id
	var research_id = req.params.research_id;
	
	// query the database for research
	//var reseachQuery = citadelModel.findOne({slug:research_id});
	//researchQuery.exec(function(err, currentResearch){

	citadelModel.findOne({slug:research_id}, function(err, currentResearch){

		if (err) {
			return res.status(500).send("There was an error on the research query");
		}

		if (currentResearch == null) {
			return res.status(404).render('404.html');
		}

		console.log("Found topics");
		console.log(currentResearch.topic);

		// formattedpostDate function for currentResearch
		currentResearch.formattedpostDate = function() {
			// formatting a JS date with moment
			// http://momentjs.com/docs/#/displaying/format/
            return moment(this.postdate).format("dddd, MMMM Do YYYY");
        };
		
		//query for all research, return only headline and slug
		citadelModel.find({}, 'headline slug', function(err, allResearch){

			console.log("retrieved all research : " + allResearch.length);

			//prepare template data for view
			var templateData = {
				research_n : currentResearch,
				research : allResearch,
				pageTitle : currentResearch.headline
			}

			// render and return the template
			res.render('detail.html', templateData);


		}) // end of .find (all) query
		
	}); // end of .findOne query

}

/*
	GET /create
*/
exports.researchForm = function(req, res){

	var templateData = {
		//research : allResearch,
		page_title : 'Begin a new topic'
	};

	res.render('create_form.html', templateData);
}

/*
	POST /create
*/
exports.createResearch = function(req, res) {
	
	console.log("received form submission");
	console.log(req.body);

	// accept form post data
	var newResearch = new citadelModel({
		topic : req.body.topic,
		headline : req.body.headline,
		urlO : req.body.urlO,
		postdate : req.body.postdate,
		media : req.body.media,
		text : req.body.text,
		slug : req.body.headline.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});

	// you can also add properties with the . (dot) notation
	newResearch.postdate = moment(req.body.postdate);
	newResearch.twitter = req.body.twitter.split(",");
	newResearch.tags = req.body.tags.split(",");

	// breaking news checkbox
	if (req.body.breakingnews) {
		newResearch.breakingnews = true;
	}
	
	if (req.body.vetted){
		newResearch.vetted = true;
	}
	
	// save the newResearch to the database
	newResearch.save(function(err){
		if (err) {
			console.error("Error on saving new topic");
			console.error("err");
			return res.send("There was an error when creating a new research topic");

		} else {
			console.log("Created a new topic!");
			console.log(newResearch);
			
			// redirect to the topic page
			res.redirect('/research/'+ newResearch.slug)
		}
	});
};


//edit the form NEW CODE ------------------------
exports.editResearchForm = function(req, res) {

	// Get research from URL params
	var research_id = req.params.research_id;
	var researchQuery = citadelModel.findOne({slug:research_id});
	researchQuery.exec(function(err, research){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ research_id).status(500);
		}

		if (research != null) {

			// html input type=date needs YYYY-MM-DD format
		/*	research.birthdateForm = function() {
					return moment(this.birthdate).format("YYYY-MM-DD");
			}*/

			// prepare template data
			var templateData = {
				research : allResearch
			};

			// render template
			res.render('edit_form.html',templateData);

		} else {

			console.log("unable to find research: " + research_id);
			return res.status(404).render('404.html');
		}

	})

}

exports.updateAstro = function(req, res) {

	// Get research from URL params
	var research_id = req.params.research_id;

	// prepare form data
	var updatedData = {
		topic : req.body.topic,
		headline : req.body.headline,
		urlO : req.body.urlO,
		postdate : req.body.postdate,
		media : req.body.media,
		text : req.body.text,		
		birthdate : moment(req.body.birthdate).toDate(),
	//	skills : req.body.skills.split(","),
	//	walkedOnMoon : (req.body.walkedonmoon) ? true : false
	}

	// query for research
	citadelModel.update({slug:research_id}, { $set: updatedData}, function(err, research){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error updating "+ research_id).status(500);
		}

		if (research != null) {
			res.redirect('/researches/' + research_id);


		} else {

			// unable to find research, return 404
			console.error("unable to find research: " + research_id);
			return res.status(404).render('404.html');
		}
	})
}

exports.postShipLog = function(req, res) {

	// Get research from URL params
	var research_id = req.params.research_id;

	// query database for research
	citadelModel.findOne({slug:research_id}, function(err, research){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ research_id).status(500);
		}

		if (research != null) {

			// found the research

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

			research.shiplogs.push(logData);
			research.save(function(err){
				if (err) {
					console.error(err);
					res.send(err.message);
				}
			});

			res.redirect('/researchs/' + research_id);


		} else {

			// unable to find research, return 404
			console.error("unable to find research: " + research_id);
			return res.status(404).render('404.html');
		}
	})



}
// end of new code

exports.loadData = function(req, res) {

	// load initial topic into the database
	for(a in research) {

		//get loop's current topic
		currResea = research[a];

		// prepare topic for database
		tmpResea = new citadelModel();
		tmpResea.topic = currResea.topic;
		tmpResea.slug = currResea.slug;
		tmpResea.headline = currResea.headline;
		tmpResea.missions = currResea.missions;
		tmpResea.photo = currResea.photo;
		tmpResea.source = currResea.source;
		tmpResea.breakingnews = currResea.breakingnews;
		
		// convert currResea's post date string into a native JS date with moment
		// http://momentjs.com/docs/#/parsing/string/
		tmpResea.postdate = moment(currResea.postdate); 

		// convert currResea's string of tags into an array of strings
		tmpResea.twitter = currResea.twitter.split(",");
		tmpResea.tags = currResea.tags.split(",");

		// save tmpResea to database
		tmpResea.save(function(err){
			// if an error occurred on save.
			if (err) {
				console.error("error on save");
				console.error(err);
			} else {
				console.log("changes loaded/saved in database");
			}
		});

	} //end of for-in loop

	// respond to browser
	return res.send("loaded topics");

} // end of loadData function

// Look up a research by id
// accepts an 'id' parameter
// loops through all research, checks 'id' property
// returns found research or returns false is not found
var getResearchById = function(slug) {
	for(a in research) {
		var currentResearch = research[a];

		// does current research's id match requested id?
		if (currentResearch.slug == slug) {
			return currentResearch;
		}
	}

	return false;
}


