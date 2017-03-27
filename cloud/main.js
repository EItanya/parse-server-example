
var _ = require('underscore')

// Parse.Cloud.define('createStory', function(request, response) {
//   console.log(request.params.story)
//   console.log(request.params.entry)
// });




Parse.Cloud.define("notificationService", function(request, response) {
  var TWO_HOURS = 2 * 60 * 60 * 1000; /* ms */
  console.log("We're in the notification service")
  var Story = Parse.Object.extend("Story")
  var query = new Parse.Query(Story)

  query.exists("last_update")
  query.equalTo('completed', false)
  
  query.find({
    success: function(stories) {
      console.log("successfully retrieved stories with udpates")
      _.each(stories, function(story) {
        var last_update = story.get('last_update')
        if (((new Date) - last_update) > TWO_HOURS) {
          var users = story.get("users")
          var current_user = story.get("current_user")
          var index = _.indexOf(users, current_user)
          //might have to wrap around array
          if(index === users.length - 1) {
            current_user = users[0]
          } else {
            current_user = users[index+1]
          }
          story.set("current_user", current_user)
          story.set('last_update', new Date())
          story.save(null, {
          success: function(story){
              console.log("success re-saving story")
              sendUserNotification(story, current_user)
            },
          error: function(story, error){
              console.log(error)
            }
          });
        }
      })
    },
    error: function(error) {
      console.log(error)
    }
  })
})

function sendUserNotification(story, id) {

  // var query = new Parse.Query(Parse.Installation);
  // query.exists("deviceToken");

  // var query = new Parse.Query(Parse.Installation);
  // query.equalTo('channels', id);  

  // var id = story.id
  var title = story.get('title')

  Parse.Push.send({
    channels: [ id ],
    // where: query,
    data: {
      alert: "It's now your turn for: " + title + ". You have 2 hours starting now!"
    }
    }, {
      success: function() {
        console.log("push notification was sent successfully")
        // Push was successful
      },
      error: function(error) {
        console.log("error sending push notification")
        // Handle error
      },
      useMasterKey: true
  });
}


// Parse.Cloud.define("getAllUsersForStory", function(request, response) {
  
//   var users = request.params.users
//   var storyId = request.params.storyId

//   var Invite = 


// })
//Function to update last_update to officially start turn of person
Parse.Cloud.define("startUserTurn", function(request, response) {
  var Story = Parse.Object.extend("Story");
  var query = new Parse.Query(Story)

  query.get(request.params.storyId, {
    success: function(story) {
      console.log(story.id)
      story.set('last_update', new Date())
      story.save(null, {
        success: function(story){
          response.success(story.id)
          console.log("success re-saving story")
        },
        error: function(story, error){
          response.error("Story was not re-saved correctly")
        }
      });
    },
    error: function(error) {
      console.log(error)
      response.error(error)
    }
  })
})


//Not pushed yet but this code should just 
//add an entry to the story list and save entry
Parse.Cloud.define("updateStoryWithEntry", function(request, response) {

  
  var userQuery = new Parse.Query(Parse.User)

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
          story.set("previous_entry", entry.id)
          story.set('last_update', new Date())
          story.set('current_entry', story.get('current_entry') + 1)

          if(story.get('current_entry') >= story.get('total_turns')) {
            story.set('completed', true)
            userQuery.containedIn("objectId", story.get('users'))
            userQuery.find({
              success: function(results){
                console.log("Success getting users from completed story")
                _.each(results, function(user) {
                  var new_active_stories = _.filter(user.get('active_stories'), function(val){
                    return val !== story.id
                  })
                  console.log(new_active_stories)
                  var new_completed_stories = user.get('completed_stories').push(story.id)
                  console.log(new_completed_stories)
                  user.set('active_stories', new_active_stories)
                  user.set('completed_stories', new_completed_stories)
                  user.save(null , {
                    success: function(user){
                      console.log('successfully re-saved User')
                    },
                    error: function(error) {
                      console.log('Could not re-save User')
                    }
                  });
                })
              },
              error: function(error) {
                console.log("error getting users from completed story")
              }
            })
          }
          
          //change turn to next user
          var users = story.get("users")
          var current_user = story.get("current_user")
          var index = _.indexOf(users, current_user)
          //might have to wrap around array
          if(index === users.length - 1) {
            current_user = users[0]
          } else {
            current_user = users[index+1]
          }
          story.set("current_user", current_user)
          story.save(null, {
            success: function(story){
              if (!story.get('completed')) {
                sendUserNotification(story, current_user)
              }
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
