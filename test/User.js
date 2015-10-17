// Data for each User is stored in memory instead of in
// a database. This store (and internal code within the User model)
// could in principle be replaced by a database without needing to
// modify any code in the controller.
var _store = { };
var _tweet =[];

// Model code for a User object in the note-taking app.
// Each User object stores a username, password, and collection
// of notes. Each note has some textual content and is specified
// by the owner's username as well as an ID. Each ID is unique
// only within the space of each User, so a (username, noteID)
// uniquely specifies any note.
var User = function(_store, _tweet) {

  var that = Object.create(User.prototype);

  var userExists = function(username) {
    return _store[username] !== undefined;
  }

  var getUser = function(username) {
    if (userExists(username)) {
      return _store[username];
    }
  }

  that.findByUsername = function (username, callback) {
    if (userExists(username)) {
      callback(null, getUser(username));
    } else {
      callback({ msg : 'No such user!' });
    }
  }

  that.verifyPassword = function(username, candidatepw, callback) {
    if (userExists(username)) {
      var user = getUser(username);
      if (candidatepw === user.password) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    } else {
      callback(null, false);
    }
  }

  that.createNewUser = function (username, password, callback) {
    if (userExists(username)) {
      callback({ taken: true });
    } else {
      _store[username] = { 'username' : username,
                 'password' : password};
      callback(null, getUser(username));
    }
  };

  that.getTweet = function(username, tweetId, callback) {
    if (userExists(username)) {
      if (_tweet[tweetId]) {
        var tweet = _tweet[tweetId];
        callback(null, tweet);
      } else {
        callback({ msg : 'Invalid tweet. '});
      }
    } else {
      callback({ msg : 'Invalid user. '});
    }
  };

  // that.getTweet = function(username, tweetID, callback){
  //   if (userExisits(username)){
  //     var user = getUser(username);
  //     var tweets = that.getAllTweet()
  //     if(AllTweet[tweeetID])
  //   }
  // }

  that.getTweets = function(username, callback) {
    if (userExists(username)) {
      callback(null, _tweet);
    } else {
      callback({ msg : 'Invalid user.' });
    }
  }


  that.addTweet = function(username, tweet, callback) {
    if (userExists(username)) {
      tweet._id = _tweet.length;
      _tweet.push(tweet);
      callback(null);
    } else {
      callback({ msg : 'Invalid user.' });
    }
  };

  that.updateTweet = function(username, tweetId, newContent, callback) {
    if (userExists(username)) {
      if (_tweet[tweetId]) {
        _tweet[tweetId].content = newContent;
        callback(null);
      } else {
        callback({ msg : 'Invalid tweet.' });
      }
    } else {
      callback({ msg : ' Invalid user.' });
    }
  };

  that.removeTweet = function(username, tweetId, callback) {
    if (userExists(username)) {
      if (_tweet[tweetId]) {
        delete _tweet[tweetId];
        callback(null);
      } else {
        callback({ msg : 'Invalid tweet.' });
      }
    } else {
      callback({ msg : 'Invalid user.' });
    }
  };

  Object.freeze(that);
  return that;

};