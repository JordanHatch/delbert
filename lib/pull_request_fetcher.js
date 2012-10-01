PullRequests = {
  responses: { },
  client: null,
  repositories: { },
  update: function() {
    console.log("\nStarting fetch of pull request counts for "+ PullRequests.repositories.join(', ') +"\n");

    for (x in this.repositories) {
      var repo_name = this.repositories[x];
      var api_endpoint = 'https://api.github.com/repos/alphagov/'+repo_name+'/pulls';

      console.log('['+ repo_name +'] GET ' + api_endpoint);

      this.client.get(api_endpoint, function(res) {
        var data = [];

        res.on('data', function(chunk){
          data.push(chunk);
        });

        res.on('end', function() {
          var repo_name = res.req.path.match(/\/([A-Za-z0-9-_]+)\/pulls/)[1]
          if (data !== undefined) {
            var api_response = JSON.parse( data.join('') );
          } else {
            var api_response = { }
          }

          PullRequests.responses[repo_name] = api_response;
          console.log('['+repo_name+'] Loaded '+ api_response.length +' pull requests.');
        });
      }).on('error', function(e) {
        console.log("Got error: " + e.message);
      });
    }
    setTimeout( this.update, (2 * 60 * 1000) );
  },
  output: function() {
    var request_counts = []

    for (repo_name in this.responses) {
      var requests = this.responses[repo_name];
      var blocked = false;

      for (x in requests) {
        if (requests[x].body.match(/don't merge/i)) {
          blocked = true;
        }
      }

      request_counts.push({ name: repo_name, count: requests.length, blocked: blocked });
    }

    request_counts.sort( function(a, b) { return b.count - a.count } );
    return request_counts;
  }
};
