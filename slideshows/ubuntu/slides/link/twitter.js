/* requires jquery.tweet.js */

Signals.watch('slides-loaded', function() {
	$('.twitter-stream').each(function(index, stream) {
		var tweets = $('<div class="twitter-stream-tweets">');
		$(stream).append(tweets);
		tweets.tweet({
			query: $(stream).data('twitter-query'),
			template: '<div class="tweet-inner">{real_name}{text}</div>',
			avatar_size: 48,
			count: 40,
		});
	});
});
