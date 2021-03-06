
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var Twit = require('twit');



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
always aboove the router
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
app.post('/:create', routes.createFront); //form post from the main page

//new main routes
app.get('/create',routes.mainForm); //display form
app.post('/create',routes.createMain); //form POST submits here

// display a single main
app.get('/main/:main_id', routes.detail);

// edit main
app.get('/main/:main_id/edit', routes.editMainForm); //GET display form
app.post('/main/:main_id/edit', routes.updateMain); //POST update database

// delete main
app.get('/main/:main_id/delete', routes.deleteMain);

//add a user post
app.post('/main/:main_id/addpost', routes.postUser);

//get the about page static
app.get ('/:about', routes.about);

// API JSON Data routes
app.get('/data/main',routes.data_all);
app.get('/data/main/:main_id', routes.data_detail);

// save selected tweets
app.post('/main/:main_id/savepost', routes.savePost);

// consume a remote API
//app.get('/remote_api', routes.remote_api);

/*
//authenticate with twitter
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));
*/


// create NodeJS HTTP server using 'app'
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});













