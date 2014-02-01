# GitNoDeploy

Small node.js HTTP server   
it allows you to deploy your repos into your server everytime you push a change.

## Configure

* First of all install Node.js into your server
* Rename GitNoDeploy-config-example.json to GitNoDeploy-config.json and edit it.
* port: [Default: 2001]
* quiet: Set to false to mute the script
* repos: Array of your repos:
  * url: url exactly where the script can find your repo
  * path: path exactly where is your repo dir
  * after: Array of commands to execute after updating
* On the github page go to a repository, then "Admin", "Service Hooks", "WebHook URLs" and add the url of your server + port (e.g. http://example:2001).

You can test everything by clicking on the "Test Hook" button.

## About
Author: [**Domenico Leone Luciani**](https://github.com/DLion)

Site: [DLion](http://dlion.github.io)
