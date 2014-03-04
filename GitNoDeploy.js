#! /usr/bin/env node

var http        =   require('http'),
    querystring =   require('querystring'),
    fs          =   require('fs'),
    exec        =   require('child_process').exec,
    config      =   require('./GitNoDeploy-config.json');

var GitNoDeploy = (function (http, querystring, fs, exec, config) {
  var port = config.port || 2001,
      quiet = config.quiet || false;

//Executes command after pull request
  var afterExec = function (index) {
    config.repos[index].after.forEach(function (value) {
      exec(value, function (error, stdout, stderr) {
        if (!error && !quiet) {
          console.log("[" + value + "] - (" + stdout + ")");
        }
        else {
          if(!quiet) {
            console.log("[" + value + "] - (\n" + stdout + ") - {\n" + stderr + "}");
          }
        }
      });
    });
  };

  //Execute pull on the repository
  var pull = function (index) {
    exec('cd ' + config.repos[index].path + ' && git pull', function (error, stdout, stderr) {
      if (!error) {
        if (!quiet) {
          console.log(config.repos[index].url + " updated!");
        }
        //If present execute after commands
        if (Array.isArray(config.repos[index].after)) {
          afterExec(index);
        }
        else {
          if (!quiet) {
            console.log("After is not an array!");
          }
        }
      }
      else {
        if (!quiet) {
          console.log("Error on pull request: " + error + "\n" + stdout + "\n" + stderr);
        }
      }
    });
  };

  // Function to check Repos
  var checkRepos = function (index) {
    if (config.repos[index].url.indexOf('git@') === -1) {
      if (fs.existsSync(config.repos[index].path)) {
        if (fs.existsSync(config.repos[index].path + "/.git")) {
          pull(index);
        }
        else {
          if (!quiet) {
            console.log(config.repos[index].path + " Is not a repository");
          }
        }
      }
      else {
        if (!quiet) {
          console.log(config.repos[index].path + " Not found on your filesystem!");
        }
      }
    }
    else {
      if (!quiet) {
        console.log("Repository URL " + config.repos[index].url + " should use the https:// Github URL.");
      }
    }
  };

  // Check repository on your filesystem
  var deploy = function (postData) {
    var find  = false;

    config.repos.forEach(function (value, index) {
      if (postData.repository.url === value.url) {
        find  = true;
        checkRepos(index);
      }
    });

    if (!quiet) {
      if (!find) {
        console.log("Repository not found!");
      }
      else {
        console.log("Repository found!");
      }
    }
  };

  return {
    // Start HTTP Server
    init: function () {
      var query = '';
      http.createServer(function(req, res) {
        if (req.url === '/' && req.method === 'POST') {
          if (req.method === 'POST') {
            req.on('data', function(data) {
              query += data;
            });
            req.on('end', function() {
              var postQuery = JSON.parse(querystring.parse(query,'&','=',{'maxKeys': 1}).payload);
              if (postQuery) {
                deploy(postQuery);
              }
              else {
                if (!quiet) {
                  console.log("Query didn't accepted!");
                }
              }
              res.writeHeader(200, {'Content-Type': 'text/plain'});
              res.end();
            });
          }
        }
      }).listen(port);
      if (!quiet) {
        console.log("Server Listened on port: "+port);
      }
    }
  };
}(http, querystring, fs, exec, config));

//Go
GitNoDeploy.init();
