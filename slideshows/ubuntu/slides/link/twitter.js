/* requires jquery.tweet.js */

/* FIXME: Load (and verify connection) immediately, but do not start showing tweets until twitter-stream is visible! */

var SEARCH_URL = 'http://search.twitter.com/search.json';

function escapeHTML(text) {
	return $('<div/>').text(text).html()
}

function Tweet(data) {
	var tweet = this;
	
	function escapeHTML(s) {
		return s.replace(/</g,"&lt;").replace(/>/g,"^&gt;");
	}
	
	var linkHashTag = function(hashTag) {
		return 'http://twitter.com/search?q='+escape('#'+hashTag);
	}
	
	var linkUser = function(userName) {
		return 'http://twitter.com/'+escape(userName);
	}
	
	var linkEntities = function() {
		var entities = data.entities;
		
		entityIndices = {};
		
		$.each(entities.urls, function(i, entry) {
			var link = '<a class="twitter-url" href="'+escapeHTML(entry.expanded_url)+'">'+escapeHTML(entry.display_url)+'</a>';
			entityIndices[entry.indices[0]] = [entry.indices[1], link];
		});
		
		$.each(entities.hashtags, function(i, entry) {
			var link = '<a class="twitter-hashtag" href="'+linkHashTag(entry.text)+'">'+escapeHTML('#'+entry.text)+'</a>';
			entityIndices[entry.indices[0]] = [entry.indices[1], link];
		});
		
		$.each(entities.user_mentions, function(i, entry) {
			var link = '<a class="twitter-mention" href="'+linkUser(entry.screen_name)+'">'+escapeHTML('@'+entry.screen_name)+'</a>';
			entityIndices[entry.indices[0]] = [entry.indices[1], link];
		});
		
		var result = "";
		var last_i = 0;
		var i = 0;
		
		for (i=0; i < data.text.length; ++i) {
			var ind = entityIndices[i];
			if (ind) {
				var end = ind[0];
				var output = ind[1];
				if (i > last_i) {
					result += escapeHTML(data.text.substring(last_i, i));
				}
				result += output;
				i = end - 1;
				last_i = end;
			}
		}
		
		if (i > last_i) {
			result += escapeHTML(data.text.substring(last_i, i));
		}
		
		return result;
	}
	var linkedText = linkEntities();
	
	this.getHtml = function() {
		var container = $('<div class="tweet">');
		
		var authorDetails = $('<a class="tweet-author-details">');
		authorDetails.attr('href', linkUser(data['from_user']));
		
		var authorName = $('<span class="tweet-author-name">');
		authorName.text(data['from_user_name']);
		var authorID = $('<span class="tweet-author-id">');
		authorID.text('@'+data['from_user']);
		
		authorDetails.append(authorName, authorID);
		container.append(authorDetails);
		
		var text = $('<div class="tweet-text">');
		text.html(linkedText);
		container.append(text);
		
		return container;
	}
}

function TweetsList(container) {
	var tweetsList = this;
	
	container = $(container);
	list = $('<ul class="tweets-list">');
	container.append(list);
	
	var cleanup = function() {
		var bottom = list.offsetParent().height();
		list.children().each(function(index, listItem) {
			if ($(listItem).position().top > bottom) {
				$(listItem).remove();
			}
		});
	}
	
	this.showTweet = function(tweet) {
		var listItem = $('<li>');
		listItem.html(tweet.getHtml());
		listItem.hide();
		listItem.css('opacity', '0');
		
		list.prepend(listItem);
		
		var expandTime = listItem.height() * 8;
		listItem.animate({
			'height': 'show',
			'opacity': '1'
		}, expandTime, 'linear', function() {
			cleanup();
		});
		
		/*listItem.slideDown(500);*/
	}
}

Signals.watch('slides-loaded', function() {
	$('.twitter-stream').each(function(index, stream) {
		var tweetsContainer = $('<div class="twitter-stream-tweets">');
		var tweetsList = new TweetsList(tweetsContainer);
		$(stream).append(tweetsContainer);
		
		
		var streamActive = false;
		var tweetsBuffer = [];
		
		var nextTweet = 0;
		var showNextTweet = function() {
			if (nextTweet < tweetsBuffer.length) {
				var tweet = tweetsBuffer[nextTweet];
				tweetsList.showTweet(tweet);
				nextTweet += 1;
			} else {
				loadTweets();
			}
		}
		
		var showNextInterval;
		var lastUpdate = 0;
		var loadTweets = function() {
			var request = {};
			request['q'] = "#ubuntu";
			request['lang'] = "all";
			request['rpp'] = '20';
			request['result_type'] = 'mixed'; // FIXME: I'd like to do 'popular', but it only returns one result
			request['include_entities'] = 'true';
			
			if (showNextInterval) window.clearInterval(showNextInterval);
			
			var showFirstTweet = function() {
				nextTweet = 0;
				if (streamActive) {
					if (tweetsBuffer.length > 0) {
						showNextTweet();
					}
					showNextInterval = window.setInterval(showNextTweet, 2000);
				}
			}
			
			var now = Date.now();
			if (now - lastUpdate < 600 * 1000) {
				// reuse existing data for up to 10 minutes
				showFirstTweet();
			} else {
				// pull more data from the server
				var request = $.ajax({
					url: SEARCH_URL,
					dataType: 'jsonp',
					data: request,
					timeout: 5000,
					success: function(data, status, xhr) {
						if (! 'results' in data) return;
					
						if (data.results.length > 0) {
							if (!streamActive) {
								$(stream).fadeIn(150);
								streamActive = true;
							}
							
							tweetsBuffer = [];
							$.each(data.results, function(index, tweet_data) {
								var tweet = new Tweet(tweet_data);
								tweetsBuffer.push(tweet);					
							});
						}
					},
					error: function(xhr, status, error) {
						if (tweetsBuffer.length == 0) {
							$(stream).hide();
							streamActive = false;
						}
						// otherwise, we'll keep showing the existing tweets
					},
					complete: function(xhr, status) {
						showFirstTweet();
					}
				});
				lastUpdate = now;
			}
		}
		loadTweets();
	});
});
