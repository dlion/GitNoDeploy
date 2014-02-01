#! /usr/bin/env node

var http        =   require('http');
var url         =   require('url');
var querystring =   require('querystring');
var fs          =   require('fs');
var exec        =   require('child_process').exec;
var config      =   require('./GitNoDeploy-config.json');

// Constructor
var GitNoDeploy = function () {
  this.port   = config.port   ||  2001;
  this.quiet  = config.quiet  ||  false;
  this.init();
};

//Executes command after pull request
GitNoDeploy.prototype.afterExec = function (index) {
  var self = this;
  config.repos[index].after.forEach(function (value, pos) {
    exec(value, function (error, stdout, stderr) {
      if (error === null && !self.quiet) {
        console.log("[" + value + "] - (" + stdout + ")");
      }
      else {
        if(!self.quiet) {
          console.log("[" + value + "] - (\n" + stdout + ") - {\n" + stderr + "}");
        }
      }
    });
  });
};

//Execute pull on the repository
GitNoDeploy.prototype.pull = function (index) {
  var self = this;
  exec('cd ' + config.repos[index].path + ' && git pull', function (error, stdout, stderr) {
    if (error === null) {
      if (!self.quiet) {
        console.log(config.repos[index].url + " updated!");
      }
      //If present execute after commands
      if (Array.isArray(config.repos[index].after)) {
        self.afterExec(index);
      }
      else {
        if (!self.quiet) {
          console.log("After is not an array!");
        }
      }
    }
    else {
      if (!self.quiet) {
        console.log("Error on pull request: " + error + "\n" + stdout + "\n" + stderr);
      }
    }
  });
};

// Function to check Repos
GitNoDeploy.prototype.checkRepos = function (index) {
  if (config.repos[index].url.indexOf('git@') === -1) {
    if (fs.existsSync(config.repos[index].path)) {
      if (fs.existsSync(config.repos[index].path + "/.git")) {
        this.pull(index);
      }
      else {
        if (!this.quiet) {
          console.log(config.repos[index].path + " Is not a repository");
        }
      }
    }
    else {
      if (!this.quiet) {
        console.log(config.repos[index].path + " Not found on your filesystem!");
      }
    }
  }
  else {
   if (!this.quiet) {
     console.log("Repository URL " + config.repos[index].url + " should use the https:// Github URL.");
   }
  }
};

// Check repository on your filesystem
GitNoDeploy.prototype.deploy = function (postData) {
  var self = this;
  var find = false;

  config.repos.forEach(function (value, index) {
    if (postData.repository.url === value.url) {
      find = true;
      self.checkRepos(index);
    }
  });

  if (!this.quiet) {
    if (find === false ) {
      console.log("Repository not found!");
    }
    else {
      console.log("Repository found!");
    }
  }
};

// Check Server Request
function checkRequest(req, res) {
  var self = this, query = '';
  switch (req.url) {
    case '/':
      if (req.method === 'POST') {
        req.on('data', function(data) {
          query += data;
        });
        req.on('end', function() {
          var postQuery = JSON.parse(querystring.parse(query,'&','=',{'maxKeys': 1}).payload);
          if (postQuery) {
            self.deploy(postQuery);
          }
          else {
            if (!self.quiet) {
              console.log("Query didn't accepted!");
            }
          }
          res.writeHeader(200, {'Content-Type': 'text/plain'});
          res.end();
        });
      }
    break;
  }
}

// Start HTTP Server
GitNoDeploy.prototype.init = function () {
  http.createServer(checkRequest.bind(this)).listen(this.port);
  if (!this.quiet) {
    console.log("Server Listened on port: "+this.port);
  }
};

//Go
var Go = new GitNoDeploy();
