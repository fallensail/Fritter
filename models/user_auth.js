var mongoose = require("mongoose");

var UserAuthSchema = mongoose.Schema({
  username: {type: String, index: true, unique: true},
  password: String
});
var UserAuth = mongoose.model("UserAuth", UserAuthSchema);

module.exports = UserAuth;