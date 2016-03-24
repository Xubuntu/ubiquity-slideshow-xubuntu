var contrib_interval, contrib_clear_timeout, contrib_items;
var contrib_cycle = 1;

Signals.watch( 'slideshow-loaded', function( ) {
	/* Allow using arrow keys in slide navigation */
	$( document ).keydown( function( e ) {
		if( e.keyCode == 37 && $( '#prev-slide' ).is( ':visible' ) ) {
			$( '#prev-slide' ).click( );
		} else if( e.keyCode == 39 && $( '#next-slide' ).is( ':visible' ) ) {
			$( '#next-slide' ).click( );
		}
	} );

	/* Fill div's with data from inline attribute */
	$( '#support-live .data-fill' ).each( function( e ) {
		$( this ).html( $( this ).attr( 'data-content' ) );
	} );

	/* Watch opening, opened and closing slides for some effects */
	Signals.watch( 'slide-opening', function( slide ) {
		current = slide.find( '.slide' );

		/* Applications */
		if( current.attr( 'id' ) == 'applications' ) {
			var n = 200;
			current.find( '.applist div' ).each( function( e ) {
				$( this ).delay( n ).fadeIn( );
				n = n + 100;
			} );
		}
	} );

	Signals.watch( 'slide-opened', function( slide ) {
		current = slide.find( '.slide' );

		/* Welcome */
		if( current.attr( 'id' ) == 'welcome' ) {
			current.find( '#logos div' ).each( function( e ) {
				$( this ).find( 'span' ).css( 'opacity', '0.5' );
				$( this ).find( 'img' ).delay( 600 ).fadeIn( 'slow' );
				$( this ).find( 'span' ).delay( 1200 ).fadeIn( 'slow' );
			} );
		}

		/* Desktop */
		if( current.attr( 'id' ) == 'desktop' ) {
			current.find( '.panel img' ).css( 'top', '0' );
			$( '#hilight' ).css( 'background-color', 'rgba( 230, 30, 160, 0.4 )' ).fadeIn( 10000 );
		}

		/* Support */
		if( current.attr( 'id' ) == 'support' ) {
			current.find( '#qanda' ).remove( );
			container = $( '<div id="qanda" class="fo"></div>' );
			container.appendTo( current );
			for( i = 1; i <= 4; i++ ) {
				element = $( '<div class="fo qa qa' + i + '"></div>' );
				element.appendTo( container );
				start_delay = i * 150 + ( Math.random( ) * 150 );
				element.html( '?' ).delay( start_delay ).fadeIn( 'fast' ).delay( 1500 ).fadeOut( 50 ).queue( function( next ) { $( this ).html( '!' ).fadeIn( 'fast' ); next( ); } );
			}
		}

		/* Live support */
		if( current.attr( 'id' ) == 'support-live' ) {
			current.find( '.local-de' ).fadeIn( );
			current.find( '.local-jp' ).delay( 300 ).fadeIn( );
			current.find( '.local-fr' ).delay( 700 ).fadeIn( );
			current.find( '.local-fi' ).delay( 850 ).fadeIn( );
			current.find( '.local-cat' ).delay( 3000 ).fadeIn( );
		}

		/* Contribute */
		if( current.attr( 'id' ) == 'contribute' ) {
			$( '#hilight' ).css( 'background-color', 'rgba( 3, 46, 77, 0.5 )' ).fadeIn( 400 );
			contrib_cycle = 1;
			contrib_component( );
			contrib_interval = setInterval( contrib_component, 3700 );
		}
	} );

	Signals.watch( 'slide-closing', function( slide ) {
		current = slide.find( '.slide' );

		/* Common classes */
		$( '.fo' ).clearQueue( ).stop( ).fadeOut( 200 ).css( 'opacity', '1' );

		/* Desktop */
		if( current.attr( 'id' ) == 'desktop' ) {
			current.find( '.panel img' ).css( 'top', '-25px' );
		}

		/* Contribute */
		if( current.attr( 'id' ) == 'contribute' ) {
			clearInterval( contrib_interval );
			clearInterval( contrib_clear_timeout );
		}
	} );

	/* Desktop */
	/* Highlight the portions of the panel when hovering over the information boxes */
	$( '#panel_menu' ).hover(
		function( ) { panelhighlight_show( 0, 26 ); },
		function( ) { panelhighlight_hide( ); }
	);
	$( '#panel_windowbuttons' ).hover(
		function( ) { panelhighlight_show( 32, 550 ); },
		function( ) { panelhighlight_hide( ); }
	);
	$( '#panel_indicatorsclock' ).hover(
		function( ) { panelhighlight_show( 582, 168 ); },
		function( ) { panelhighlight_hide( ); }
	);

	/* Contribute */
	contrib_items = $( '#contrib_hilight div' ).length;
} );

function panelhighlight_show( left, width ) {
	$( '#panelhighlight' ).css( 'margin-left', left + 'px' );
	$( '#panelhighlight' ).width( width + 'px' );
	$( '#panelhighlight' ).addClass( 'visible' );
}

function panelhighlight_hide( ) {
	$( '#panelhighlight' ).removeClass( 'visible' );
}

function contrib_component( ) {
	c = $( '#contrib_hilight div:nth-child( ' + contrib_cycle + ')' ).clone( );
	c.addClass( 'fo contrib' ).css( 'top', ( Math.random( ) * 70 + 10 ) + '%' );
	c.appendTo( $( '#contribute' ) );

	c.animate( { left: '60%' }, 1200, 'linear' ).animate( { left: '80%' }, 2000, 'linear' ).animate( { left: '100%' }, 400, 'linear' );

	contrib_clear_timeout = setTimeout( function( ) { c.remove( ); }, 3600 );
	contrib_cycle = contrib_cycle + 1;
	if( contrib_cycle > contrib_items ) {
		contrib_cycle = 1;
	}
}
