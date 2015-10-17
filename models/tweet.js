var mongoose = require("mongoose");

var TweetSchema = mongoose.Schema({
  tweet_id: Number,	
  username: {type: String, index: true},
  original: String,
  from: String,
  content: String
});

var Tweet = mongoose.model("Tweet", TweetSchema);

module.exports = Tweet;
