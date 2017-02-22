
Parse.Cloud.define('createStory', function(request, response) {
  console.log(request.params.story)
  console.log(request.params.entry)
  res.success('Hi');
});

// Parse.Cloud.define("createStory", function(request, response) {
//   var query = new Parse.Query("Review");
//   query.equalTo("movie", request.params.movie);
//   query.find({
//     success: function(results) {
//       var sum = 0;
//       for (var i = 0; i < results.length; ++i) {
//         sum += results[i].get("stars");
//       }
//       response.success(sum / results.length);
//     },
//     error: function() {
//       response.error("movie lookup failed");
//     }
//   });
// });