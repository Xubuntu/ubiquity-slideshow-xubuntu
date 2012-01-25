/* requires jquery.tweet.js */

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
	
	var linkHashTag = function(hashTag) {
		return 'http://twitter.com/search?q='+escape('#'+hashTag);
	}
	
	var linkUser = function(userName) {
		return 'http://twitter.com/'+escape(userName);
	}
	
	var linkEntities = function() {
		entityIndices = {};
		
		if (data.entities.media) {
			$.each(data.entities.media, function(i, entry) {
				var link = '<a class="twitter-url twitter-media" href="'+escapeHTML(entry.media_url)+'">'+escapeHTML(entry.display_url)+'</a>';
				entityIndices[entry.indices[0]] = [entry.indices[1], link];
			});
		}
		
		if (data.entities.urls) {
			$.each(data.entities.urls, function(i, entry) {
				var link = '<a class="twitter-url" href="'+escapeHTML(entry.url)+'">'+escapeHTML(entry.display_url)+'</a>';
				entityIndices[entry.indices[0]] = [entry.indices[1], link];
			});
		}
		
		if (data.entities.hashtags) {
			$.each(data.entities.hashtags, function(i, entry) {
				var link = '<a class="twitter-hashtag" href="'+linkHashTag(entry.text)+'">'+escapeHTML('#'+entry.text)+'</a>';
				entityIndices[entry.indices[0]] = [entry.indices[1], link];
			});
		}
		
		if (data.entities.user_mentions) {
			$.each(data.entities.user_mentions, function(i, entry) {
				var link = '<a class="twitter-mention" href="'+linkUser(entry.screen_name)+'">'+escapeHTML('@'+entry.screen_name)+'</a>';
				entityIndices[entry.indices[0]] = [entry.indices[1], link];
			});
		}
		
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
	
	var getNextTweet = function(returnTweet) {
		if (nextTweetIndex < tweets.length) {
			returnTweet(tweets[nextTweetIndex]);
		} else {
			nextTweetIndex = 0;
			if (query.getTimeSinceUpdate() > 10 * 60 * 1000) {
				// load new tweets every 10 minutes
				query.loadTweets(function(newTweets) {
					loadedCallback(newTweets);
					returnTweet(tweets[nextTweetIndex]);
				});
			} else {
				returnTweet(tweets[nextTweetIndex]);
			}
		}
	}
	
	
	this.dataIsAvailable = function(response) {
		getNextTweet(function(tweet) {
			response ( (tweet !== undefined) );
		});
	}
	
	/* Loads (if necessary) the next tweet and sends it asynchronously to
	 * the tweetReceived(tweet) callback. The tweet parameter is undefined
	 * if no tweets are available.
	 */
	this.popTweet = function(tweetReceived) {
		getNextTweet(function(tweet) {
			nextTweetIndex += 1;
			tweetReceived(tweet);
		});
	}
}

function TwitterStream(streamContainer) {
	var twitterStream = this;
	
	var tweetsContainer = $(streamContainer).children('.twitter-stream-tweets');
	var tweetsList = new TweetsList(tweetsContainer);
	
	var tweetBuffer = new TweetBuffer();
	
	var showNextInterval = undefined;
	
	var showNextTweet = function() {
		tweetBuffer.popTweet(function(tweet) {
			if (tweet) {
				twitterStream.enable();
				tweetsList.showTweet(tweet);
			} else {
				// this isn't working, so we'll hide the stream
				twitterStream.disable();
			}
		});
	}
	
	var _enabled = false;
	this.isEnabled = function() {
		return _enabled;
	}
	this.enable = function(immediate) {
		if (_enabled) return;
		if (immediate) {
			$(streamContainer).show();
		} else {
			$(streamContainer).fadeIn(150);
		}
		_enabled = true;
	}
	this.disable = function(immediate) {
		if (! _enabled) return;
		if (immediate) {
			$(streamContainer).hide();
		} else {
			$(streamContainer).fadeOut(150);
		}
		_enabled = false;
		this.stop();
	}
	
	this.start = function() {
		this.stop();
		showNextInterval = window.setInterval(showNextTweet, 5000);
	}
	this.stop = function() {
		if (showNextInterval) window.clearInterval(showNextInterval);
	}
	
	var _init = function() {
		tweetBuffer.dataIsAvailable(function(available) {
			if (available) {
				twitterStream.enable(true);
				// make sure there is some content visible from the start
				showNextTweet();
			} else {
				twitterStream.disable(true);
			}
		});
	}
	_init();
}

Signals.watch('slideshow-loaded', function() {
	$('.twitter-stream').each(function(index, streamContainer) {
		var stream = new TwitterStream(streamContainer);
		$(streamContainer).data('stream-object', stream);
		// TODO: test connection, show immediately if connection is good
	});
	
	$('.twitter-post-status-link').each(function(index, linkContent) {
		// Twitter-post-status-link is a <div> to avoid being translated. We need to wrap it around an <a> tag
		var statusText = $(linkContent).children('.twitter-post-status-text').text();
		var link = $('<a>');
		link.attr('href', 'http://twitter.com/home?status='+encodeURIComponent(statusText));
		link.insertBefore(linkContent);
		$(linkContent).appendTo(link);
	});
});

Signals.watch('slide-opened', function(slide) {
	var streamContainers = $('.twitter-stream', slide);
	streamContainers.each(function(index, streamContainer) {
		var stream = $(streamContainer).data('stream-object');
		if (stream) {
			stream.start();
		}
	});
});

Signals.watch('slide-closing', function(slide) {
	var streamContainers = $('.twitter-stream', slide);
	streamContainers.each(function(index, streamContainer) {
		var stream = $(streamContainer).data('stream-object');
		if (stream) {
			stream.stop();
		}
	});
});

