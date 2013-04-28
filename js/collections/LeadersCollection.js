define("collections/LeadersCollection", ["jquery","backbone", "models/LeaderModel"],
    function($, Backbone, LeaderModel) {

        // Extends Backbone.Router
        var LeadersCollection = StackMob.Collection.extend( {

            // The Collection constructor
            initialize: function( models, options ) {

                // Sets the type instance property (ie. animals)

            },

            Model: LeaderModel

        } );

        return LeadersCollection;

    }
);