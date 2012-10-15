var express = require('express'),
    http    = require("http"),
    https   = require("https"),
    ejs      = require('ejs');

require('./lib/pull_request_fetcher.js');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

PullRequests.client = https;
PullRequests.repositories = require('./repositories.json');

if (process.env.gh_client_id) {
  PullRequests.client_id = process.env.gh_client_id;
}
if (process.env.gh_client_secret) {
  PullRequests.client_secret = process.env.gh_client_secret;
}

app.get('/', function(req, res){
  res.render('dashboard');
});

app.get('/requests.json', function(req, res){
  res.send(JSON.stringify(PullRequests.output()));
})

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port '+ port);

PullRequests.update();
