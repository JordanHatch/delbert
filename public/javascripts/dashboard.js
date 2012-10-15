var render_pull_requests = function(data) {
  if (data.error && data.error == "rate_limited") {
    $('.error').html('<h1>Rate limit reached.</h1><p>Normal service will resume shortly.</p>').show();
    return;
  }

  $('.repositories, .total, .error').html('');

  $('.total').html('<strong>'+ data.total +'</strong>open requests');
  $.each( data.repositories, function(key, repository){
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
  var refresh_delay = 15e3;
  $.getJSON('/requests.json', function(data){
    render_pull_requests(data);
  });
  timer(refresh_delay);
  setTimeout(update_pull_requests, refresh_delay);
}

// from https://github.com/edds/jenkins-dashboard/blob/master/javascripts/main.js
var timer = function(duration){
  var loader = document.getElementById("refresh-timer"),
      end = +new Date() + duration,
      radius = 12,
      interval;

  interval = window.setInterval(function(){
    if(+new Date() > end){
      window.clearInterval(interval);
      return true;
    }
    var degrees = 360 - 360*((end - new Date())/duration),
        y = -Math.cos((degrees/180)*Math.PI)*radius,
        x = Math.sin((degrees/180)*Math.PI)*radius,
        mid = (degrees < 180) ? '0,1' : '1,1',
        d = "M"+radius+","+radius+" v -"+radius+" A"+radius+","+radius+" 1 "+mid+" " + (x+radius) + "," + (y+radius) + " z";
    loader.setAttribute("d", d);
  }, 50);
};

$(function() {
  update_pull_requests();
});
