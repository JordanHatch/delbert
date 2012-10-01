var render_pull_requests = function(data) {
  $('.repositories').html('');

  $.each( data, function(key, repository){
    var container = $("<section class='repository'></section>");
    var count = $("<p></p>");

    $("<h1></h1>").text(repository.name).appendTo(container);

    count.text(repository.count)
    if (repository.blocked) {
      count.append('*');
    }
    count.appendTo(container);

    if (repository.count == 0) {
      container.addClass('without-requests');
    }

    container.appendTo('.repositories');
  });
}

var update_pull_requests = function() {
  $.getJSON('/requests.json', function(data){
    render_pull_requests(data);
  });
  setTimeout(update_pull_requests, 60 * 1000)
}

$(function() {
  update_pull_requests();
});
