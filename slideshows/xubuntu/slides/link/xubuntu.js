Signals.watch('slideshow-loaded', function() {

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

	/* Show paths on hover */
	$( document ).on( 'mouseover', '.app', function( e ) {
		var path = '[data-path="' + $( this ).attr( 'data-app' ) + '"]';
		$( path ).fadeIn( );
	} );

	$( document ).on( 'mouseleave', '.app', function( e ) {
		var path = '[data-path="' + $( this ).attr( 'data-app' ) + '"]';
		$( path ).fadeOut( );
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