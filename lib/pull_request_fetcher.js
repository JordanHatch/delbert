PullRequests = {
  responses: { },
  client: null,
  rateLimited: false,
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

          if (api_response.message && api_response.message.match(/API Rate Limit Exceeded/i)) {
            PullRequests.rateLimited = true;
            console.log('['+repo_name+'] err: API Rate Limit Exceeded.');
          } else {
            PullRequests.responses[repo_name] = api_response;
            PullRequests.rateLimited = false;
            console.log('['+repo_name+'] Loaded '+ api_response.length +' pull requests.');
          }
        });
      }).on('error', function(e) {
        console.log("Got error: " + e.message);
      });
    }
    setTimeout( PullRequests.update, (30 * 1000) );
  },
  output: function() {
    var request_counts = []
    var total = 0;

    if (PullRequests.rateLimited == true) {
      return { "error": "rate_limited" };
    }

    for (repo_name in PullRequests.responses) {
      var requests = PullRequests.responses[repo_name];
      var blocked = false;

      if (requests === undefined) {
        requests = [ ];
      }

      for (x in requests) {
        if (requests[x].body && requests[x].body.match(/(don't|do not) merge/i)) {
          blocked = true;
        }
      }

      total = total + requests.length;
      request_counts.push({ name: repo_name, count: requests.length, blocked: blocked });
    }

    request_counts.sort( function(a, b) { return b.count - a.count } );
    response = { "repositories": request_counts, "total": total };

    return response;
  }
};
