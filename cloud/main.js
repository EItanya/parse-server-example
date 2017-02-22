
// Parse.Cloud.define('createStory', function(request, response) {
//   console.log(request.params.story)
//   console.log(request.params.entry)
// });

Parse.Cloud.define("createStory", function(request, response) {

  var story = new Parse.Object("Story")
  var entry = new Parse.Object("Entry")

  story.set(request.params.story)
  entry.set(request.params.entry)

  console.log(story)

  Parse.Object.saveAll([story, entry], {
    success: function(list) {
      console.log(list)
      entry.fetch({
        success: function(myObject){
          console.log(myObject)
          story.set("first_entry", myObject.objectId)
          story.save(null, {
            success: function(myObject) {
              console.log(myObject)
              response.success(true)
            },
            error: function(){
              response.error("Story could not be resaved")
              console.log("story could not be resaved")
            }
          })
        },
        error: function(myObject, error) {
          response.error("Entry could not be retrieved from DB")
          console.log(error)
        }
      })
    },
    error: function(error) {
      response.error("Story, or Entry could not be saved to DB")
      console.log(error)
    }
  })

  // var query = new Parse.Query("Review");
  // query.equalTo("movie", request.params.movie);
  // query.find({
  //   success: function(results) {
  //     var sum = 0;
  //     for (var i = 0; i < results.length; ++i) {
  //       sum += results[i].get("stars");
  //     }
  //     response.success(sum / results.length);
  //   },
  //   error: function() {
  //     response.error("movie lookup failed");
  //   }
  // });
});