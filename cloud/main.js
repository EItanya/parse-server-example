
// Parse.Cloud.define('createStory', function(request, response) {
//   console.log(request.params.story)
//   console.log(request.params.entry)
// });

Parse.Cloud.define("createStory", function(request, response) {
  console.log(request.params.story)
  console.log(request.params.entry)

  var story = new Parse.Object("Story")
  var entry = new Parse.Object("Entry")

  Parse.Object.saveAll([story, entry], {
    success: function(list) {
      console.log(list)
      entry.fetch({
        success: function(myObject){
          console.log(myObject)
          story.set("first_entry", myObject.objectId)
        },
        error: function(myObject, error) {
          console.log(error)
        }
      })
    },
    error: function(error) {
      console.log(error)
    }
  })

});