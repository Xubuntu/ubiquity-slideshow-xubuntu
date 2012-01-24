/*
Slideshow script for ubiquity-slideshow, global to all variations.

* Interprets parameters passed via location.hash (in #?param1=key?param2 format)
* Creates an animated slideshow inside the #slideshow element.
* Automatically loads a requested locale, based on the default slides.
* Manages slideshow controls, if requested via parameters.

Assumptions are made about the design of the html document this is inside of.
Please see slides/ubuntu/index.html for an example of this script in use.

Please include this script last, after any other scripts.


Dependencies (please load these first):
link-core/jquery.js
link-core/jquery.cycle.all.js
link-core/signals.js
directory.js (note that this file does not exist yet, but will when the build script runs)
*/

/* Pass parameters by creating a global SLIDESHOW_OPTIONS object, containing
   any options described at <http://jquery.malsup.com/cycle/options.html>
   
   The default callback for cycle.next also checks an extra autopause parameter,
   which will pause the slideshow when it reaches the end (but doesn't stop it)
   
   Signals: slideshow-loaded
            slideshow-started
            slide-opening
            slide-opened
            slide-closing
            slide-closed
*/

var slideshow;

$(document).ready(function() {
	slideshow = $('#slideshow');
	
	var slideshow_options = {
		fx:'scrollHorz',
		timeout:45000,
		speed:500,
		nowrap:false,
		autopause:true,
		manualTrump:false,
	};
	$.extend(slideshow_options, window.SLIDESHOW_OPTIONS);
	
	if ( 'locale' in INSTANCE_OPTIONS )
		setLocale(instance_options['locale']);
	
	if ( 'rtl' in INSTANCE_OPTIONS )
		$(document.body).addClass('rtl');
	
	loadSlides();
	Signals.fire('slideshow-loaded');
	
	slideshow_options.before = function(curr, next, opts) {
		if ($(next).data('last')) {
			$('#next-slide').addClass('disabled').fadeOut(slideshow_options.speed);
		} else {
			$('#next-slide').removeClass('disabled').fadeIn(slideshow_options.speed);
		}
		
		if ($(next).data('first')) {
			$('#prev-slide').addClass('disabled').fadeOut(slideshow_options.speed);
		} else {
			$('#prev-slide').removeClass('disabled').fadeIn(slideshow_options.speed);
		}
		
		Signals.fire('slide-closing', $(curr));
		Signals.fire('slide-opening', $(next));
	}
	
	slideshow_options.after = function(curr, next, opts) {
		var index = opts.currSlide;
		/* pause at last slide if requested in options */
		if ( index == opts.slideCount - 1 && opts.autopause ) {
			slideshow.cycle('pause'); /* slides can still be advanced manually */
		}
		
		Signals.fire('slide-closed', $(curr));
		Signals.fire('slide-opened', $(next));
	}
	
	var controls = $('#controls');
	if ( 'controls' in INSTANCE_OPTIONS ) {
		var debug_controls = $('#debug-controls');
		if (debug_controls.length > 0) {
			debug_controls.show();
			controls = debug_controls;
		}
	}
	slideshow_options.prev = controls.children('#prev-slide');
	slideshow_options.next = controls.children('#next-slide');
	
	slideshow.cycle(slideshow_options);
	Signals.fire('slideshow-started');
});


function setLocale(locale) {
	slideshow.find('div>a').each(function() {
		var new_url = get_translated_url($(this).attr('href'), locale);
		
		if ( new_url != null ) {
			$(this).attr('href', new_url);
		}
	})
	
	function get_translated_url(slide_name, locale) {
		var translated_url = null
		
		if ( translation_exists(slide_name, locale) ) {
			translated_url = "./loc."+locale+"/"+slide_name;
		} else {
			var before_dot = locale.split(".",1)[0];
			var before_underscore = before_dot.split("_",1)[0];
			if ( before_underscore != null && translation_exists(slide_name, before_underscore) )
				translated_url = "./loc."+before_underscore+"/"+slide_name;
			else if ( before_dot != null && translation_exists(slide_name, before_dot) )
				translated_url = "./loc."+before_dot+"/"+slide_name;
		}
		
		return translated_url;
	}
	
	function translation_exists(slide_name, locale) {
		result = false;
		try {
			result = ( directory[locale][slide_name] == true );
		} catch(err) {
			/*
			This usually happens if the directory object
			(auto-generated at build time, placed in ./directory.js)
			does not exist. That object is needed to know whether
			a translation exists for the given locale.
			*/
		}
		return result;
	}
}


function loadSlides() {
	var slides = slideshow.children('div');
	slides.css('display', 'none');
	slides.each(function(index, slide) {
		url = $(slide).children('a').attr('href');
		if (index == 0) $(slide).data('first', true);
		if (index == slides.length-1) $(slide).data('last', true);
		$.ajax({
			url: url,
			async: false,
			success: function(data, status, xhr) {
				$(slide).append(data);	
			}
		});
	});
}

