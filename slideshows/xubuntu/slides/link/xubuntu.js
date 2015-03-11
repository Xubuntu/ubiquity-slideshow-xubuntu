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
	$( '.app' ).live( 'mouseover', function( e ) {
		var path = '[data-path="' + $( this ).attr( 'data-app' ) + '"]';
		$( path ).fadeIn( );
	} );

	$( '.app' ).live( 'mouseleave', function( e ) {
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