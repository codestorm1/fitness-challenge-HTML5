// Sets the require.js configuration for your application.
require.config( {

      // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
      paths: {

            // Core Libraries
          "backbone": "libs/backbone",
          "mustache": "libs/mustache",
          "jquery": "libs/jquery",
            "jquerymobile": "libs/jquerymobile",
            "underscore": "libs/lodash",
            "json2": "libs/json2-min",
            "stackmob" : "libs/stackmob-js-0.6.0-min"

//"underscore" : "http://static.stackmob.com/js/underscore-1.4.1-min.js"
//    <script type="text/javascript" src="http://static.stackmob.com/js/backbone-0.9.2-min.js"></script>


},

      // Sets the configuration for your third party scripts that are not AMD compatible
      shim: {

            "backbone": {
                  "deps": [ "underscore", "jquery" ],
                  "exports": "Backbone"  //attaches "Backbone" to the window object
            },
            "stackmob": {
                  "deps": [ "jquery", "backbone" ],
                  "exports": "StackMob"
            },
          "mustache": {
              "exports": "Mustache"
          }


      } // end Shim Configuration

} );

// Includes File Dependencies
require([ "jquery", "backbone", "routers/FitnessRouter", "stackmob" ], function( $, Backbone, Mobile, StackMob ) {

	$( document ).on( "mobileinit",
		// Set up the "mobileinit" handler before requiring jQuery Mobile's module
		function() {
			// Prevents all anchor click handling including the addition of active button state and alternate link bluring.
			$.mobile.linkBindingEnabled = false;

			// Disabling this will prevent jQuery Mobile from handling hash changes
			$.mobile.hashListeningEnabled = false;
		}
	)

    require( [ "jquerymobile" ], function() {
		// Instantiates a new Backbone.js Mobile Router
		this.router = new Mobile();
	});
} );