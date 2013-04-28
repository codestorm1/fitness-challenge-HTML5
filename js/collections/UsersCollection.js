define("collections/UsersCollection", ["jquery","backbone", "models/UserModel"],
    function($, Backbone, UserModel) {

        // Extends Backbone.Router
        var UsersCollection = StackMob.Collection.extend( {

            // The Collection constructor
            initialize: function( models, options ) {

                // Sets the type instance property (ie. animals)

            },

            Model: UserModel

        } );

        return UsersCollection;

    }
);