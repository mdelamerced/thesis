
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

// the ExpressJS App
var app = express();

// configuration of port, templates (/views), static files (/public)
// and other expressjs settings for the web server.
app.configure(function(){

  // server port number
  app.set('port', process.env.PORT || 5000);

  //  templates directory to 'views'
  app.set('views', __dirname + '/views');

  // setup template engine - we're using Hogan-Express
  app.set('view engine', 'html');
  app.set('layout','layout');
  app.engine('html', require('hogan-express')); // https://github.com/vol4ok/hogan-express

  app.use(express.favicon());
  // app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // database 
  app.db = mongoose.connect(process.env.MONGOLAB_URI);
  console.log("connected to database");
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* 
SKIPPING FOR FUTURE CLASSES
SESSIONS w/ MongoDB (store sessions across multiple dynos)
COOKIEHASH in your .env file (also share with heroku) 
*/
// app.use(express.cookieParser(process.env.COOKIEHASH));
// app.use(express.session({ 
//     store: new mongoStore({url:process.env.MONGOLAB_URI, maxAge: 300000})
//     , secret: process.env.COOKIEHASH
//   })
// );

// ROUTES

var routes = require('./routes/index.js');

app.get('/', routes.index);

//display a single entry
app.get('/research/:research_id', routes.detail);

//new  routes
app.get('/create',routes.researchForm); //display form
app.post('/create',routes.createResearch); //form POST submits here

app.get('/loadtopics', routes.loadData); // loads topics into array into db

// edit research
app.get('/research/:research_id/edit', routes.editResearchForm); //GET display form
app.post('/research/:research_id/edit', routes.updateResearch); //POST update database

// add ship's log
app.post('/research/:research_id/addshiplog', routes.postShipLog);

// create NodeJS HTTP server using 'app'
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});













