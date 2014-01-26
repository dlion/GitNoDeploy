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
GitNoDeploy.prototype.deploy = function(postData) {
  console.log("Arrivato: "+postData.ciao);
}

// Check Server Request
function checkRequest(req, res) {
  var self = this;
  switch(req.url) {
    case '/':
      if(req.method === 'POST') {
        var query = '';
        req.on('data', function(data) {
          query += data;
        });
        req.on('end', function() {
          res.writeHeader(200, {"Content-Type": "text/plain"});
          res.end();
          var postQuery = JSON.parse(querystring.parse(query).payload);
          if(postQuery) {
            // Request sent to me
            self.deploy(postQuery);
          }
        });
      }
      break;
  }
}

// Init
GitNoDeploy.prototype.init = function() {
  http.createServer(checkRequest.bind(this)).listen(this.port);
  console.log("Server Listened on port: "+this.port);
};

var Go = new GitNoDeploy();
