Signals.watch('slideshow-loaded', function() {

	/* Highlight the portions of the panel when hovering over the information boxes */
	$( '#panel_menu' ).hover(
		function( ) { panelhighlight_show( 0, 26 ); },
		function( ) { panelhighlight_hide( ); }
	);
	$( '#panel_windowbuttons' ).hover(
		function( ) { panelhighlight_show( 32, 576 ); },
		function( ) { panelhighlight_hide( ); }
	);
	$( '#panel_indicatorsclock' ).hover(
		function( ) { panelhighlight_show( 608, 142 ); },
		function( ) { panelhighlight_hide( ); }
	);

	/* Show paths on hover */
	$( 'span.expand' ).live( 'mouseover', function( e ) {
		var path_id = '#path-' + $( this ).attr( 'id' );
		$( path_id ).fadeIn( );
	} );

	$( 'span.expand' ).live( 'mouseleave', function( e ) {
		var path_id = '#path-' + $( this ).attr( 'id' );
		$( path_id ).fadeOut( );
	} );

	/* App search */
	$( 'input#search' ).keyup( function( e ) {
		var search_term = $( 'input#search' ).val( );

		$( '#results li' ).each( function( e ) {
			var item = $( this ).text( );
			if( item.indexOf( search_term ) > -1 ) {
				$( this ).show( );
			} else {
				$( this ).hide( );
			}
		} );
	} );

} );

function panelhighlight_show( left, width ) {
	$( '#panelhighlight' ).css( 'margin-left', left + 'px' );
	$( '#panelhighlight' ).width( width + 'px' );
	$( '#panelhighlight' ).addClass( 'visible' );
}

function panelhighlight_hide( ) {
	$( '#panelhighlight' ).removeClass( 'visible' );
}

/* Wallpaper changing slide... */
Signals.watch('slide-opened', function( current ) {
	if( $( current ).attr( 'id' ) == 'wp' ) {
		setInterval( function( ) { changeWall( ); }, 5000 );
	}
} );

var wall_i = 0;

function changeWall( ) {
	var walls = [ '../images/wall1.jpg', '../images/wall2.jpg' ];
	wall_i = wall_i + 1;

	if( wall_i > walls.length ) {
		wall_i = 0;
	}

	var wall_class = 'wall-' + wall_i;

	$( '#wallpapers' ).removeClass(  );
	$( '#wallpapers' ).addClass( wall_class );
}

