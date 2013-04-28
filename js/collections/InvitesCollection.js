define("collections/InvitesCollection", ["jquery","backbone", "models/InviteModel"],
    function($, Backbone, InviteModel) {

        // Extends Backbone.Router
        var InvitesCollection = StackMob.Collection.extend( {

            // The Collection constructor
            initialize: function( models, options ) {

                // Sets the type instance property (ie. animals)

            },

            Model: InviteModel

        } );

        return InvitesCollection;

    }
);

