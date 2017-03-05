
// Parse.Cloud.define('createStory', function(request, response) {
//   console.log(request.params.story)
//   console.log(request.params.entry)
// });

//Not pushed yet but this code should just 
//add an entry to the story list and save entry
Parse.Cloud.define("updateStoryWithEntry", function(request, response) {

  var Story = Parse.Object.extend("Story");
  var query = new Parse.Query(Story)
  query.get(request.params.storyId, {
    success: function(story) {
      //Create and save new Entry
      var entry = new Parse.Object("Entry")
      entry.set(request.params.entry)
      entry.save(null, {
        success: function(entry) {
          // Execute any logic that should take place after the object is saved.
          //In this case add an entry to the entry_array
          var entry_ids = story.get("entry_ids")
          entry_ids.push(entry.id)
          story.set("entry_ids",  entry_ids)
          story.save(null, {
            success: function(story){
              response.success(story.id)
              console.log("success")
            },
            error: function(story, error){
              response.error("Story was not re-saved correctly")
            }
          });
        },
        error: function(entry, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          console.log('Failed to create new object, with error code: ' + error.message);
          response.error("Entry could not be saved to DB")
        }
      })
      // The object was retrieved successfully.
    },
    error: function(object, error) {
      // The object was not retrieved successfully.
      // error is a Parse.Error with an error code and message.
      response.error("Story could not be retrieved from DB")
    }
  });

})


Parse.Cloud.define("createStory", function(request, response) {


  var story = new Parse.Object("Story")
  var entry = new Parse.Object("Entry")

  story.set(request.params.story)
  entry.set(request.params.entry)


  entry.save(null, {
    success: function(entry) {
      // Execute any logic that should take place after the object is saved.
      story.set('first_entry', entry.id)
      story.set('previous_entry', entry.id)
      story.set('entry_ids', [entry.id])
      story.save(null, {
        success: function(story){
          response.success(story.id);
        },
        error: function(story, error){
          response.error("Story was not saved correctly")
        }
      });
    },
    error: function(entry, error) {
      // Execute any logic that should take place if the save fails.
      // error is a Parse.Error with an error code and message.
      console.log('Failed to create new object, with error code: ' + error.message);
      response.error("Entry could not be saved to DB")
    }
  });

});
