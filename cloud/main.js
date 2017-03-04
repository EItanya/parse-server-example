
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
          var userQuery = new Parse.Query(Parse.User);
          userQuery.equalTo("objectId", userId);
          //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
          getUser(id).then(   
              function(user){
                  //User is Here
                  var completedArray = user.get("completed_stories")
                  completedArray.push(story.id)
                  user.set("completed_stories", completedArray)
                  response.success(story)
              },
              function(error){
                  response.error(error);
              }
          );
          // response.success(story);
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

function getUser(userId)
{
    Parse.Cloud.useMasterKey();
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first
    ({
        success: function(userRetrieved)
        {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error)
        {
            return error;
        }
    });
};