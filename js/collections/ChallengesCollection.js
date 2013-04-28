define("collections/ChallengesCollection", ["jquery","backbone","models/ChallengeModel"],
    function($, Backbone, ChallengeModel) {

        // Extends Backbone.Router
        var ChallengesCollection = StackMob.Collection.extend( {

            // The Collection constructor
            initialize: function( models, options ) {

                // Sets the type instance property (ie. animals)

            },

            Model: ChallengeModel

        } );

        return ChallengesCollection;

        }
);