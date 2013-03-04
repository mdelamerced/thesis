
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

	//get the requested astronaut by the param on the url :research_id
	var research_id = req.params.research_id;

	// query the database for astronaut
	citadelModel.findOne({slug:research_id}, function(err, currentResearch){

		if (err) {
			return res.status(500).send("There was an error on the astronaut query");
		}

		if (currentResearch == null) {
			return res.status(404).render('404.html');
		}

		console.log("Found topics");
		console.log(currentResearch.headline);

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
		page_title : 'Begin a new research topic'
	};

	res.render('create_form.html', templateData);
}

/*
	POST /create
*/
exports.createAstro = function(req, res) {
	
	console.log("received form submission");
	console.log(req.body);

	// accept form post data
	var newResearch = new citadelModel({
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
			
			// redirect to the astronaut's page
			res.redirect('/research/'+ newResearch.slug)
		}

	});

	
	

}

exports.loadData = function(req, res) {

	// load initial astronauts into the database
	for(a in research) {

		//get loop's current astronuat
		currResea = research[a];

		// prepare astronaut for database
		tmpResea = new citadelModel();
		tmpResea.slug = currResea.slug;
		tmpResea.headline = currResea.headline;
		tmpResea.missions = currResea.missions;
		tmpResea.photo = currResea.photo;
		tmpResea.source = currResea.source;
		tmpResea.walkedOnMoon = currResea.walkedOnMoon;
		
		// convert currResea's post date string into a native JS date with moment
		// http://momentjs.com/docs/#/parsing/string/
		tmpResea.postdate = moment(currResea.postdate); 

		// convert currResea's string of tags into an array of strings
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



/*
	fake Data
*/ 

var research = [];
research.push({
	slug : 'john_glenn',
	headline : 'John Glenn',
	postdate: 'July 18, 1921',
	missions : ['Mercury-Atlas 6','STS-95'],
	media : 'http://upload.wikimedia.org/wikipedia/commons/thumb/9/93/GPN-2000-001027.jpg/394px-GPN-2000-001027.jpg',
	twitter: ['nasa','MarsCuriosity'],
	text : 'none',
	tags : 'Test pilot',
	breakingnews : false,
	vetted : true
});


// Look up a research by id
// accepts an 'id' parameter
// loops through all astronauts, checks 'id' property
// returns found astronaut or returns false is not found
var getResearchById = function(slug) {
	for(a in research) {
		var currentResearch = research[a];

		// does current astronaut's id match requested id?
		if (currentResearch.slug == slug) {
			return currentResearch;
		}
	}

	return false;
}


