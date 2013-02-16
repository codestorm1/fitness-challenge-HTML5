// Mobile Router
// =============

// Includes file dependencies
define([ "jquery","backbone", "../fitness", "../customCodeClient", "../models/CategoryModel", "../models/ChallengeModel", "../collections/CategoriesCollection", "../views/FooterView", "../views/HomeView", "../views/FriendsView", "../views/LoginView", "../views/RegisterView", "../views/ProfileView", "../views/AuthView", "../views/CategoryView", "../views/ChallengeView" ],
    function( $, Backbone, fitness, customCode, CategoryModel, ChallengeModel, CategoriesCollection, FooterView, HomeView, FriendsView, LoginView, RegisterView, ProfileView, AuthView, CategoryView, ChallengeView ) {

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

            this.challengeView = new ChallengeView( { el: "#create", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );

            this.registerView = new RegisterView( { el: "#register", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );
            this.authView = new AuthView( { el: "#auth", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );
            this.friendsView = new FriendsView( { el: "#friends", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );

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
            "profile" : "profile",
            "friends" : "friends",
            "register" : "register",
            "auth" : "auth"

        },

        ensureLogin: function(callback) {
            if (fitness.isLoggedIn()) {
                callback(true);
                return;
            }
            var username = localStorage.getItem('username');
            if (!username) {
                callback(false);
                return;
            }
            fitness.loginWithID(username, function(success) {
                callback(success);
                return;
            });
        },

        sendToLogin: function() {
            $.mobile.loading("show");
            var footerView = new FooterView( { el: "#login .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
            $.mobile.changePage( "#login" , { reverse: false, changeHash: true } );
        },

        // Home method
        home: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.sendToLogin();
                    return;
                }
                if (fitness.user && fitness.user.get('accesstoken')) {
                    //$.mobile.loading("show");
                    var footerView = new FooterView( { el: "#home .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                    $.mobile.changePage( "#home" , { reverse: false, changeHash: false } );
                }
                else { // need to auth with Fitbit
                    if (window.location.href.indexOf('oauth_token') !== -1) { // user authorized on Fitbit and was redirected here
                        var requestToken = localStorage.getItem("request_token");
                        if (!requestToken) {
                            fitness.showMessage('Missing Fitbit request token.'); // need to start over with request token call
                            var footerView = new FooterView( { el: "#auth .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                            $.mobile.loading("show");
                            $.mobile.changePage( "#auth" , { reverse: false, changeHash: true } );
                            return;
                        }
                        var requestTokenSecret = localStorage.getItem("request_token_secret");
                        var oauthVerifier = customCode.getQueryVariable(window.location.href, 'oauth_verifier'); // TODO move getQueryVariable to another js lib

                        var pos = oauthVerifier.length - 1;
                        if (oauthVerifier[pos] === '/') { // stackmob mistakenly adds a slash to the URL, so remove it
                            oauthVerifier = oauthVerifier.substring(0, pos).replace('#',''); // also kill a # if there is one
                        }
                        customCode.completeFitbitAuth(fitness.user, requestToken, requestTokenSecret, oauthVerifier, function(success, data) {
                            if (success) {
                                var accessTokenData = data;
                                fitness.user.set('accesstoken', accessTokenData.oauth_token);
                                fitness.user.set('accesstokensecret', accessTokenData.oauth_token_secret);
                                fitness.user.set('fitbituserid', accessTokenData.fitbit_user_id);
                                localStorage.removeItem('request_token');
                                localStorage.removeItem('request_token_secret');

                                var footerView = new FooterView( { el: "#home .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                                $.mobile.changePage( "#home" , { reverse: false, changeHash: true } );
                            }
                            else {
                                localStorage.removeItem('request_token');
                                localStorage.removeItem('request_token_secret');
                                fitness.showMessage(data);
                            }
                        })
                    }
                    else {
                        var footerView = new FooterView( { el: "#auth .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                        $.mobile.loading("show");
                        $.mobile.changePage( "#auth" , { reverse: false, changeHash: true } );
                    }
                }
            });
        },

        activeChallenges: function() {
            var footerView = new FooterView( { el: "#profile .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
            $.mobile.changePage( "#profile" , { reverse: true, changeHash: false } );
        },

        profile: function() {
            this.ensureLogin(function(success) {
                var footerView = new FooterView( { el: "#profile .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                this.profileView = new ProfileView( { el: "#profile", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );
                $.mobile.changePage( "#profile" , { reverse: true, changeHash: true } );
            });
        },

        login: function() {
            var footerView = new FooterView( { el: "#login .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
            $.mobile.changePage( "#login" , { reverse: false, changeHash: false } );
        },

        register: function() {
            var footerView = new FooterView( { el: "#register .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
            $.mobile.changePage( "#register" , { reverse: false, changeHash: false } );
        },

        auth: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.sendToLogin();
                    return;
                }
                var footerView = new FooterView( { el: "#auth .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                $.mobile.changePage( "#auth" , { reverse: false, changeHash: false } );
            });
        },

        create: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.sendToLogin();
                    return;
                }
                var footerView = new FooterView( { el: "#create .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                $.mobile.changePage( "#create" , { reverse: true, changeHash: true } );
            });
        },

        friends: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.sendToLogin();
                    return;
                }
                var footerView = new FooterView( { el: "#friends .footer", collection: new CategoriesCollection( [] , { type: "challenges" } ) } ); // TODO: collection needed?
                $.mobile.changePage( "#friends" , { reverse: true, changeHash: false } );
            });
        },
        // Category method that passes in the type that is appended to the url hash
        category: function(type) {

            // Stores the current Category View  inside of the currentView variable
            var currentView = this[ type + "View" ];

            // If there are no collections in the current Category View
            if (!currentView.collection.length) {

                // Shows the jQuery Mobile loading icon
                $.mobile.loading("show");

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