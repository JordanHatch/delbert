PullRequests = {
  responses: { },
  client: null,
  repositories: { },
  update: function() {
    console.log("\nStarting fetch of pull request counts for "+ PullRequests.repositories.join(', ') +"\n");

    for (x in PullRequests.repositories) {
      var repo_name = PullRequests.repositories[x];
      var api_endpoint = 'https://api.github.com/repos/alphagov/'+repo_name+'/pulls';

      console.log('['+ repo_name +'] GET ' + api_endpoint);

      PullRequests.client.get(api_endpoint, function(res) {
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
    setTimeout( PullRequests.update, (30 * 1000) );
  },
  output: function() {
    var request_counts = []

    for (repo_name in PullRequests.responses) {
      var requests = PullRequests.responses[repo_name];
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
