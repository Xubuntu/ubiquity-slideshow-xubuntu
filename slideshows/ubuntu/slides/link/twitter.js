/* requires jquery.tweet.js */

/* FIXME: Load (and verify connection) immediately, but do not start showing tweets until twitter-stream is visible! */
/* FIXME: We need to localize “I'm installing #Ubuntu” in the twitter-stream-header link! */
/* TODO: Fix tweet slideDown animation to actually slide down instead of changing height */

function escapeHTML(text) {
	return $('<div/>').text(text).html()
}

function spliceText(text, indices) {
	// Copyright 2010, Wade Simmons <https://gist.github.com/442463>
	// Licensed under the MIT license
	var result = "";
	var last_i = 0;
	var i = 0;
	
	for (i=0; i < text.length; ++i) {
		var ind = indices[i];
		if (ind) {
			var end = ind[0];
			var output = ind[1];
			if (i > last_i) {
				result += escapeHTML(text.substring(last_i, i));
			}
			result += output;
			i = end - 1;
			last_i = end;
		}
	}
	
	if (i > last_i) {
		result += escapeHTML(text.substring(last_i, i));
	}
	
	return result;
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
		
		return spliceText(data.text, entityIndices);
	}
	var linkedText = linkEntities();
	
	this.getHtml = function() {
		var container = $('<div class="tweet">');
		
		var authorDetails = $('<a class="tweet-author-details">');
		authorDetails.attr('href', linkUser(data['from_user']));
		
		var authorName = $('<span class="tweet-author-name">');
		authorName.text(data['from_user_name']);
		var authorID = $('<span class="tweet-author-id">');
		authorID.text(data['from_user']);
		
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
		var bottom = container.height();
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

function TweetQuery(lang) {
	var tweetQuery = this;
	
	var QUERY_URL = 'http://search.twitter.com/search.json';
	// note we can support identi.ca with http://identi.ca/api/search.json
	
	lang = lang || 'all';
	var request = {
		'q' : '#ubuntu',
		'lang' : lang,
		'rpp' : '30',
		'result_type' : 'recent', // FIXME: I'd like to do 'popular', but it only returns one result
		'include_entities' : 'true'
	};
	// request is tightly encapsulated because we might move that logic to a remote server
	
	var lastUpdate = 0;
	
	/** Time since last update, in seconds */
	this.getTimeSinceUpdate = function() {
		var now = Date.now();
		return now - lastUpdate;
	}
	
	this.loadTweets = function(loadedCallback) {
		var newTweets = [];
		
		$.ajax({
			url: QUERY_URL,
			dataType: 'jsonp',
			data: request,
			timeout: 5000,
			success: function(data, status, xhr) {
				if ('results' in data) {
					$.each(data.results, function(index, tweet_data) {
						var tweet = new Tweet(tweet_data);
						newTweets.push(tweet);					
					});
				}
			},
			complete: function(xhr, status) {
				loadedCallback(newTweets);
			}
		});
		lastUpdate = Date.now();
	}
}

function TweetBuffer() {
	var tweetBuffer = this;
	
	var query = new TweetQuery('all');
	
	var tweets = [];
	var nextTweetIndex = 0;
	
	var loadedCallback = function(newTweets) {
		if (newTweets.length > 0) {
			tweets = newTweets;
		}
		nextTweet = 0;
	}
	
	/* Loads (if necessary) the next tweet and asynchronously sends it to
	 * the tweetRetrieved(tweet) callback. The tweet parameter is undefined
	 * if no tweets are available.
	 */
	this.getNextTweet = function(tweetRetrieved) {
		var advanceBufferAndReturn = function() {
			var tweet = tweets[nextTweetIndex];
			nextTweetIndex += 1;
			tweetRetrieved(tweet);
		}
		
		if (nextTweetIndex < tweets.length) {
			advanceBufferAndReturn();
		} else {
			nextTweetIndex = 0;
			if (query.getTimeSinceUpdate() > 10 * 60 * 1000) {
				// load new tweets every 10 minutes
				query.loadTweets(function(newTweets) {
					loadedCallback(newTweets);
					advanceBufferAndReturn();
				});
			} else {
				advanceBufferAndReturn();
			}
		}
	}
}

Signals.watch('slides-loaded', function() {
	$('.twitter-stream').each(function(index, stream) {
		var tweetsContainer = $(stream).children('.twitter-stream-tweets');
		var tweetsList = new TweetsList(tweetsContainer);
		
		
		var streamActive = false;
		var tweetBuffer = new TweetBuffer();
		
		var showNextInterval = undefined;
		var showNextTweet = function() {
			tweetBuffer.getNextTweet(function(tweet) {
				if (tweet) {
					if (! streamActive) {
						$(stream).fadeIn(150);
						streamActive = true;
					}
					tweetsList.showTweet(tweet);
				} else {
					// this isn't working, so we'll hide the stream
					if (streamActive) {
						$(stream).hide();
						streamActive = false;
					}
					if (showNextInterval) window.clearInterval(showNextInterval);
				}
			});
		}
		
		showNextInterval = window.setInterval(showNextTweet, 5000);
		showNextTweet();
	});
});

