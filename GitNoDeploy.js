#! /usr/bin/env node

var http        =   require('http');
var url         =   require('url');
var querystring =   require('querystring');
var config      =   require('./GitNoDeploy-config.json');

// Constructor
var GitNoDeploy = function() {
  this.port = config.port || 2001;
  this.init();
};

// Function to execute pull action to your repositories
function deploy(postData) {
  console.log("Arrivato: "+postData);
}

// Check Server Request
function checkRequest(req, res) {
  res.writeHeader(200, {"Content-Type": "text/plain"});
  res.end();
  switch(req.url) {
    case '/':
      if(req.method === 'POST') {
        var query = '';
        req.on('data', function(data) {
          query += data;
        });
        req.on('end', function() {
          var postQuery = querystring.parse(query);
          if(postQuery) {
            // Request sent to me
            deploy(postQuery);
          }
        });
      }
      break;
  }
}

// Init
GitNoDeploy.prototype.init = function() {
  http.createServer(checkRequest).listen(this.port);
  console.log("Server Listened on port: "+this.port);
};

var Go = new GitNoDeploy();
