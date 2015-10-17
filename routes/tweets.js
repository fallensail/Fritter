var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var UserAuth = require("../models/user_auth");
var Tweet = require('../models/tweet');
var Follow = require('../models/follow');

var getTweet = function(username, tweetId, callback) {
  UserAuth.find({username:username}, function(err,results){
    // console.log(results);
    // console.log(Tweet);
    // console.log('show tweetId');
    // console.log(tweetId);
    if(results.length > 0){
      Tweet.find({tweet_id:tweetId}, function(err,results_tweet){
          // console.log(results_tweet);
        if(results_tweet.length>0){
          var tweet = results_tweet[0];
          callback(null,tweet);
        } else{
          callback({ msg : 'Invalid tweet. '});
        }
      })
    } else{
      callback({msg : 'Invalid user. '});
    }
  });
};

var getTweets = function(username, callback) {
  UserAuth.find({username:username}, function(err,results){
    if(results.length>0){
      Tweet.find({tweet_id:{$gte:0}}, function(err, results_tweet){
        var output = {display_tweets: results_tweet};
        Follow.find({follower:username}, function(err,results_follow){
          var results_following_array = results_follow.map(function(obj){return obj.following});
          output.display_following = results_following_array;
          callback(null,output);
        });        
      });
    } else {
      callback({msg : 'Invalid User.'});
    }
  });
};

var addTweet = function(username, tweet, callback) {
  UserAuth.find({username:username}, function(err,results){
    if(results.length>0){
      Tweet.find({}, function(err, results_tweet){
        tweet.tweet_id = results_tweet.length;
        tweet.original = username,
        tweet.from = username,
        Tweet.create(tweet, function(err,results_add){
          //console.log(results_add);
          callback(null);
        });
      });
    } else {
      callback({msg : 'Invalid User.'});
    }
  });
};  

var updateTweet = function(username, tweetId, newContent, callback) {
  UserAuth.find({username:username}, function(err,results){
    if(results.length>0){
      Tweet.find({tweet_id:tweetId}, function(err, results_tweet){
          if(results_tweet.length>0){
            Tweet.findOneAndUpdate({tweet_id:tweetId}, { content : newContent }, function(err, results_update){
              callback(null);
            })
          } else {
            callback({ msg : 'Invalid tweet.' });
          }
        });
    } else {
      callback({msg : 'Invalid User.'});
    }
  });
};

var reTweet = function(username_original, retweet_username, tweetId, callback) {
  UserAuth.find({username:username_original}, function(err,results){
    if(results.length>0){
      Tweet.find({tweet_id:tweetId}, function(err, results_tweet){
          if(results_tweet.length>0){
            var retweet = results_tweet[0];
            retweet.username = retweet_username;
            Tweet.find({}, function(err, results_tweet_new){
                retweet.tweet_id = results_tweet_new.length;
                Tweet.create({tweet_id :retweet.tweet_id, 
                  username: retweet.username, 
                  content: retweet.content, 
                  original: retweet.original,
                  from:username_original }, function(err,results_add){ 
                  callback(null);
                });
            })
          } else {
            callback({ msg : 'Invalid tweet.' });
          }
        });
    } else {
      callback({msg : 'Invalid Original User.'});
    }
  });
};


var removeTweet = function(username, tweetId, callback) {
  UserAuth.find({username:username}, function(err,results){
    if(results.length>0){
      Tweet.find({tweet_id:tweetId}, function(err, results_tweet){
          if(results_tweet.length>0){
            Tweet.findOneAndUpdate({tweet_id:tweetId}, { tweet_id : -1-tweetId }, function(err, results_update){
              callback(null);
            })
          } else {
            callback({ msg : 'Invalid tweet.' });
          }
        });
    } else {
      callback({msg : 'Invalid User.'});
    }
  });
};  

// var addFollow = function(username_follower, username_following, callback){
//   if (username_follower === username_following){
//     callback({msg : 'cannot follow yourself!'});
//   };
//   UserAuth.find({username:username_follower}, function(err,results_follower){
//     if(results_follower.length>0){
//       UserAuth.find({username:username_following}, function(err, results_following){
//         if(results_following.length>0){
//           Follow.find({follower:username_follower}, function(err,results_follow){
//             var matching = results_follow.filter(function(object){
//               if (object.following === username_following){
//                 return true;
//               }
//               else{
//                 return false;
//               }
//             })
//             if(matching.length===0){
//               Follow.create({follower:username_follower, following:username_following}, function(err, results_follow_f){callback(null)} );
//             } else{
//               callback({ msg : 'Already followed! '});
//             }
//           });
//         } else{
//           callback({msg : 'Invalid following user. '});
//         }
//       });
//     } else{
//       callback({msg : 'Invalid followed user. '});
//     }
//   });
// };

// var getFollowTweets = function(username, callback){
//   UserAuth.find({username:username}, function(err, results){
//     if(results.length>0){
//       Follow.find({follower:username}, function(err, following_results){
//         var following_user = following_results.map(function(obj){return obj.following});
//         Tweet.find({username:{"$in":following_user}}, function(err, getfollow_results){
//           var filter_negative_results = getfollow_results.filter( function(obj){
//             if(obj.tweet_id>=0){
//               return true;
//             }else{
//               return false;}
//             });
//           callback(null,filter_negative_results);
//         });
//       });
//     } else{
//       callback({msg : 'Invalid user. '});
//     }
//   });
// };

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }
};

/*
  Require ownership whenever accessing a particular note
  This means that the client accessing the resource must be logged in
  as the user that originally created the note. Clients who are not owners 
  of this particular resource will receive a 404.

  Why 404? We don't want to distinguish between notes that don't exist at all
  and notes that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information.
*/
var requireOwnership = function(req, res, next) {
  if (!(req.currentUser.username === req.tweet.username)) {
    utils.sendErrResponse(res, 404, 'Not the Same User!');
  } else {
    next();
  }
};

/*
  For create and edit requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function(req, res, next) {
  if (!req.body.content) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

/*
  Grab a note from the store whenever one is referenced with an ID in the
  request path (any routes defined with :note as a paramter).
*/
router.param('tweet', function(req, res, next, tweetId) {
  //console.log('show router param in tweets');
  getTweet(req.currentUser.username, tweetId, function(err, tweet) {
    if (tweet) {
      req.tweet = tweet;
      //console.log(tweet);
      next();
    } 
    else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
});

// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.all('/update/:tweet', requireOwnership);
router.all('/delete/:tweet', requireOwnership);
router.post('/update/:tweet', requireContent);
router.post('/delete/:tweet', requireContent);
router.post('/', requireContent);


/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that note
  3. Requests are well-formed
*/

/*
  GET /notes
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's notes
    - content: on success, an object with a single field 'notes', which contains a list of the
    user's notes
    - err: on failure, an error message
*/
router.get('/', function(req, res) {
  getTweets(req.currentUser.username, function(err, output) {
    if (err) {
      //console.log(err);
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res, { output: output });
    }
  });
});


/*
  GET /notes/:note
  Request parameters:
    - note: the unique ID of the note within the logged in user's note collection
  Response:
    - success: true if the server succeeded in getting the user's notes
    - content: on success, the note object with ID equal to the note referenced in the URL
    - err: on failure, an error message
*/
router.get('/:tweet', function(req, res) {
  utils.sendSuccessResponse(res, req.tweet);
});

/*
  POST /notes
  Request body:
    - content: the content of the note
  Response:
    - success: true if the server succeeded in recording the user's note
    - err: on failure, an error message
*/
router.post('/', function(req, res) {
  addTweet(req.currentUser.username, {
    content: req.body.content,
    username: req.currentUser.username
  }, function(err, tweet) {
    if (err) {
      //console.log('here');
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});


/*
  POST /notes/:note
  Request parameters:
    - note ID: the unique ID of the note within the logged in user's note collection.
  Response:
    - success: true if the server succeeded in recording the user's note
    - err: on failure, an error message
*/
router.post('/update/:tweet', function(req, res) {
  updateTweet(
    req.currentUser.username, 
    req.tweet.tweet_id, 
    req.body.content, 
    function(err) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
      } else {
        utils.sendSuccessResponse(res);
      }
  });
});

router.post('/retweet/:tweet', function(req,res){
//console.log('click retweet'); 
//console.log(req.tweet.username);
//console.log(req.currentUser.username);
//console.log(req.tweet.username);

//console.log(req.tweet.tweet_id);
  reTweet(req.tweet.username, req.currentUser.username, req.tweet.tweet_id, function(err, tweet) {
    if (err) {
      //console.log('here');
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});


/*
  DELETE /notes/:note
  Request parameters:
    - note ID: the unique ID of the note within the logged in user's note collection
  Response:
    - success: true if the server succeeded in deleting the user's note
    - err: on failure, an error message
*/
router.delete('/delete/:tweet', function(req, res) {
  removeTweet(
    req.currentUser.username, 
    req.tweet.tweet_id, 
    function(err) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
      } else {
        utils.sendSuccessResponse(res);
      }
  });
});



module.exports = router;
