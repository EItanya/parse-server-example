
// Parse.Cloud.define('createStory', function(request, response) {
//   console.log(request.params.story)
//   console.log(request.params.entry)
// });

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
      story.set('entry_ids', [str(entry.id)])
      story.save(null, {
        success: function(story){
          response.success(story);
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

  // Parse.Object.saveAll(objs).then(
  //   function(results){
  //     console.log(results)
  //     entry.fetch({
  //       success: function(myObject){
  //         console.log(myObject)
  //         story.set("first_entry", myObject.objectId)
  //         story.save(null, {
  //           success: function(myObject) {
  //             console.log(myObject)
  //             response.success(true)
  //           },
  //           error: function(){
  //             response.error("Story could not be resaved")
  //             console.log("story could not be resaved")
  //           }
  //         })
  //       },
  //       error: function(myObject, error) {
  //         response.error("Entry could not be retrieved from DB")
  //         console.log(error)
  //       }
  //     })
  //   }, function(error){
  //     esponse.error("Story, or Entry could not be saved to DB")
  //     console.log(error)
  //   }
  // );
  
  // , {
  //   success: function(list) {
  //     console.log(list)
  //     entry.fetch({
  //       success: function(myObject){
  //         console.log(myObject)
  //         story.set("first_entry", myObject.objectId)
  //         story.save(null, {
  //           success: function(myObject) {
  //             console.log(myObject)
  //             response.success(true)
  //           },
  //           error: function(){
  //             response.error("Story could not be resaved")
  //             console.log("story could not be resaved")
  //           }
  //         })
  //       },
  //       error: function(myObject, error) {
  //         response.error("Entry could not be retrieved from DB")
  //         console.log(error)
  //       }
  //     })
  //   },
  //   error: function(error) {
  //     response.error("Story, or Entry could not be saved to DB")
  //     console.log(error)
  //   }
  // })

});