// Sets the require.js configuration for your application.
require.config( {

      // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
      paths: {

            // Core Libraries
          "underscore": "libs/underscore-1.4.1-min",
          "backbone": "libs/backbone-0.9.2-min",
          "jquery": "libs/jquery-1.8.2.min",
          "mustache": "libs/mustache",
          "jquerymobile": "libs/jquery.mobile-1.2.0.min",
            //"underscore": "libs/lodash",
          "json2": "libs/json2-min",
          "stackmob" : "libs/stackmob-js-0.8.0-min"

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
require([ "jquery", "routers/FitnessRouter", "stackmob" ], function( $, FitnessRouter, StackMob ) {

	$( document ).on( "mobileinit",
		// Set up the "mobileinit" handler before requiring jQuery Mobile's module
		function() {
            $.mobile.ajaxEnabled = false; // ???
            $.mobile.linkBindingEnabled = false;
            $.mobile.hashListeningEnabled = false;
            $.mobile.pushStateEnabled = false;
            return;
		}
	)

    require( [ "jquerymobile" ], function() {
		// Instantiates a new Backbone.js Mobile Router
        window.router = new FitnessRouter(); // TODO: figure out how to put this in a namespace
        router.navigate();
    });
} );