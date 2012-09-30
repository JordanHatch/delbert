var render_pull_requests = function(data) {
  $('.repositories').html('');

  // data.sort();
  $.each( data, function(repository, count){
    var container = $("<section class='repository'></section>");

    $("<h1></h1>").text(repository).appendTo(container);
    $("<p></p>").text(count).appendTo(container);

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
