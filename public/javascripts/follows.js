// Wrapped in an immediately invoked function expression.
(function() {
  $(document).on('click', '#follow', function(evt) {
    loadFollowTweetsPage();
  });

  $(document).on('click', '#all_tweet', function(evt) {
    loadHomePage();
  });

  $(document).on('click', '#follow_key', function(evt) {
      var item = $(this).parent();
      var id = item.data('tweet-id'); 
      console.log("public_follow");
      $.post(
          '/follows/'+id
      ).done(function(response) {
          loadHomePage();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });
})();