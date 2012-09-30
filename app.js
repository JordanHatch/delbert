var express = require('express'),
    http    = require("http"),
    https   = require("https"),
    ejs      = require('ejs');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

var repositories = require('./repositories.json');
var pull_requests = { }

var update_pull_request_counts = function() {
  console.log("\nStarting fetch of pull request counts for "+ repositories.join(', ') +"\n");

  for (x in repositories) {
    var repo_name = repositories[x];
    var api_endpoint = 'https://api.github.com/repos/alphagov/'+repo_name+'/pulls';

    console.log('['+ repo_name +'] GET ' + api_endpoint);
    https.get(api_endpoint, function(res) {
      var data = [];
      res.on('data', function(chunk){
        data.push(chunk);
      });

      res.on('end', function() {
        var repo_name = res.req.path.match(/\/([A-Za-z0-9-_]+)\/pulls/)[1]
        var api_response = JSON.parse( data.join('') );
        pull_requests[repo_name] = api_response.length;
        console.log('['+repo_name+'] Loaded '+ api_response.length +' pull requests.');
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  }
  setTimeout( update_pull_request_counts, (2 * 60 * 1000) );
}

app.get('/', function(req, res){
  res.render('dashboard');
});

app.get('/requests.json', function(req, res){
  res.send(JSON.stringify(pull_requests));
})

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port '+ port);

update_pull_request_counts();
