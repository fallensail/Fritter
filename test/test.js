module('Initialization Test');
test('User test', function(){
	var U ={};
	var T = [];
	var Test = User(U,T);
	Test.createNewUser("sam","1234",function(err,tt){
		return tt;
	});
	Test.createNewUser("wxf","9871",function(err,tt){
		return tt;
	});
	equal(U["sam"].username,"sam",'identity creation');
	equal(U["sam"].password,"1234", 'password test');
	equal(U["wxf"].username,"wxf",'identity creation');
	equal(U["wxf"].password,"9871", 'password test');
	Test.createNewUser("sam","123322",function(err,tt){
		return tt;
	});
	equal(U["sam"].password,"1234", 'password test remain same');

	Test.createNewUser("Sam","123789",function(err,tt){
		return tt;
	});
	equal(U["Sam"].password,"123789", 'password test with different user!');	
});

module('Tweets Test');
test('Tweet test', function(){
	var U ={};
	var T = [];
	var Test = User(U,T);
	Test.createNewUser("sam","1234",function(err,tt){
		return tt;
	});
	Test.createNewUser("Sam","123789",function(err,tt){
		return tt;
	});

	Test.addTweet("sam",{creator:"sam", content:"hey"},function(err,tt){
		return tt;
	});
	equal(T[0]._id,0, 'tweet id test');	
	equal(T[0].content,"hey", 'message content test');	

	Test.updateTweet("sam",0,"hello",function(err,tt){
		return tt;
	});
	equal(T[0].content,"hello", 'tweet content updated test');

	Test.addTweet("Sam",{creator:"Sam", content:"heoooo"},function(err,tt){
		return tt;
	});
	equal(T[1]._id,1, 'tweet id test for new tweet');

	Test.removeTweet("Sam",1,function(err,tt){
		return tt;
	});
	equal(T[1],undefined, 'tweet remove test');	
	equal(T.length,2,'length does not change after remove');

});