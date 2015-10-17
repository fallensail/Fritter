var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var UserAuth = require("../models/user_auth");
var Tweet = require('../models/tweet');
var Follow = require('../models/follow');

var getTweet = function(username, tweetId, callback) {
  UserAuth.find({username:username}, function(err,results){
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

router.param('follow', function(req, res, next, tweetId) {
  // console.log('follow router param');
  // console.log(req.currentUser.username);
  // console.log(tweetId);
  getTweet(req.currentUser.username, tweetId, function(err, tweet) {
    console.log('getTweet running');
    if (tweet) {
      req.tweet = tweet;
      next();
    } 
    else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
  console.log('end of param in follow');
});


var addFollow = function(username_follower, username_following, callback){
  if (username_follower === username_following){
    callback({msg : 'cannot follow yourself!'});
  };
  UserAuth.find({username:username_follower}, function(err,results_follower){
    if(results_follower.length>0){
      UserAuth.find({username:username_following}, function(err, results_following){
        if(results_following.length>0){
          Follow.find({follower:username_follower}, function(err,results_follow){
            var matching = results_follow.filter(function(object){
            	if (object.following === username_following){
            		return true;
            	}
            	else{
            		return false;
            	}
            })
            if(matching.length===0){
              Follow.create({follower:username_follower, following:username_following}, function(err, results_follow_f){callback(null)} );
            } else{
              callback({ msg : 'Already followed! '});
            }
          });
        } else{
          callback({msg : 'Invalid following user. '});
        }
      });
    } else{
      callback({msg : 'Invalid followed user. '});
    }
  });
};

var getFollowTweets = function(username, callback){
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

router.post('/:follow', function(req,res){
  // console.log('here addfollow');
  // console.log(req.currentUser.username);
  // console.log(req.tweet.username);	
  addFollow(req.currentUser.username,req.tweet.username, function(err){
      if (err) {
        utils.sendErrResponse(res, 500, 'Already Followed.');
      } else {
        utils.sendSuccessResponse(res);
      }
  });
});


router.get('/', function(req, res){
  getFollowTweets(req.currentUser.username, function(err, output) {
    if (err) {
      console.log(err);
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res, { output: output });
    }
  });
});

module.exports = router;
