// Mobile Router
// =============

// Includes file dependencies
define([ "jquery","backbone", "../models/CategoryModel", "../models/ChallengeModel", "../collections/CategoriesCollection", "../views/HomeView", "../views/LoginView", "../views/RegisterView", "../views/CategoryView", "../views/ChallengeView" ], function( $, Backbone, CategoryModel, ChallengeModel, CategoriesCollection, HomeView, LoginView, RegisterView, CategoryView, ChallengeView ) {

    // Extends Backbone.Router
    var FitnessRouter = Backbone.Router.extend( {

        // The Router constructor
        initialize: function() {

//            $('#header').html(new HeaderView().render().el);
            // Instantiates a new Animal Category View
            this.animalsView = new CategoryView( { el: "#animals", collection: new CategoriesCollection( [] , { type: "animals" } ) } );

            // Instantiates a new Colors Category View
            this.colorsView = new CategoryView( { el: "#colors", collection: new CategoriesCollection( [] , { type: "colors" } ) } );

            // Instantiates a new Vehicles Category View
            this.vehiclesView = new CategoryView( { el: "#vehicles", collection: new CategoriesCollection( [] , { type: "vehicles" } ) } );

            this.homeView = new HomeView( { el: "#home", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?

            this.loginView = new LoginView( { el: "#login", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );

            this.challengeView = new ChallengeView( { el: "#create_challenge", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );

            this.registerView = new RegisterView( { el: "#register", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );

            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();

        },

        // Backbone.js Routes
        routes: {

            // When there is no hash bang on the url, the home method is called
            "": "home",
            "home": "home",
            "login" : "login",
            "logout" : "login",

            // When #category? is on the url, the category method is called
            "category?:type": "category",

            "create" : "create",
            "friends" : "friends",
            "register" : "register"

        },

        // Home method
        home: function() {
            $.mobile.changePage( "#home" , { reverse: false, changeHash: false } );
        },

        login: function() {
            $.mobile.changePage( "#login" , { reverse: false, changeHash: false } );
        },

        register: function() {
            $.mobile.changePage( "#register" , { reverse: false, changeHash: false } );
        },

        create: function() {
            $.mobile.changePage( "#create_challenge" , { reverse: true, changeHash: false } );
        },

        friends: function() {
            $.mobile.changePage( "#home" , { reverse: true, changeHash: false } );
        },
        // Category method that passes in the type that is appended to the url hash
        category: function(type) {

            // Stores the current Category View  inside of the currentView variable
            var currentView = this[ type + "View" ];

            // If there are no collections in the current Category View
            if(!currentView.collection.length) {

                // Show's the jQuery Mobile loading icon
                $.mobile.loading( "show" );

                // Fetches the Collection of Category Models for the current Category View
                currentView.collection.fetch().done( function() {

                    // Programatically changes to the current categories page
                    $.mobile.changePage( "#" + type, { reverse: false, changeHash: false } );
    
                } );
            }

            // If there already collections in the current Category View
            else {
                // Programatically changes to the current categories page
                $.mobile.changePage( "#" + type, { reverse: false, changeHash: false } );
            }
        }
    } );

    // Returns the Router class
    return FitnessRouter;

} );