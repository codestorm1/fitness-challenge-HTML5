// Mobile Router
// =============

// Includes file dependencies
define([ "jquery","backbone", "../fitness", "../customCodeClient", "../models/CategoryModel", "../models/ChallengeModel", "../collections/CategoriesCollection", "../views/HomeView", "../views/LoginView", "../views/RegisterView", "../views/AuthView", "../views/CategoryView", "../views/ChallengeView" ],
    function( $, Backbone, fitness, customCode, CategoryModel, ChallengeModel, CategoriesCollection, HomeView, LoginView, RegisterView, AuthView, CategoryView, ChallengeView ) {

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
            this.authView = new AuthView( { el: "#auth", collection: new CategoriesCollection( [] , { type: "challenges" } ) } );

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
            "register" : "register",
            "auth" : "auth"

        },

        loginWithID : function(username, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            if (!username) {
                callback(false);
                return;
            }
            var user = new StackMob.User({ username: username });
            user.fetch({
                success: function(model) {
                    fitness.user = model;
                    callback(true, model);
                },
                error: function(data) {
                    fitness.showMessage('Could not retrieve your user data');
                    callback(false, data);
                }
            });
        },

        ensureLogin: function(callback) {
            if (fitness.user) {
                callback(true);
                return;
            }
            var username = localStorage.getItem('username');
            if (!username) {
                callback(false);
                return;
            }
            this.loginWithID(username, function(success) {
                callback(success);
                return;
            });
        },

        sendToLogin: function() {
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
                    $.mobile.changePage( "#home" , { reverse: false, changeHash: false } );
                }
                else { // need to auth with Fitbit
                    if (window.location.href.indexOf('oauth_token') !== -1) { // user authorized on Fitbit and was redirected here
                        var requestToken = localStorage.getItem("request_token");
                        if (!requestToken) {
                            fitness.showMessage('Missing Fitbit request token.'); // need to start over with request token call
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
                        $.mobile.changePage( "#auth" , { reverse: false, changeHash: true } );
                    }
                }
            });
        },

        login: function() {
            $.mobile.changePage( "#login" , { reverse: false, changeHash: false } );
        },

        register: function() {
            $.mobile.changePage( "#register" , { reverse: false, changeHash: false } );
        },

        auth: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.sendToLogin();
                    return;
                }
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
                $.mobile.changePage( "#create_challenge" , { reverse: true, changeHash: false } );
            });
        },

        friends: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.sendToLogin();
                    return;
                }
                $.mobile.changePage( "#home" , { reverse: true, changeHash: false } );
            });
        },
        // Category method that passes in the type that is appended to the url hash
        category: function(type) {

            // Stores the current Category View  inside of the currentView variable
            var currentView = this[ type + "View" ];

            // If there are no collections in the current Category View
            if (!currentView.collection.length) {

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