// Mobile Router
// =============

// Includes file dependencies
define([ "jquery","backbone", "../fitness", "../customCodeClient", "../models/CategoryModel", "../models/ChallengeModel", "../views/FooterView", "../views/HomeView", "../views/FriendsView", "../views/LoginView", "../views/RegisterView", "../views/ProfileView", "../views/AuthView", "../views/ChallengeView" ],
    function( $, Backbone, fitness, customCode, CategoryModel, ChallengeModel, FooterView, HomeView, FriendsView, LoginView, RegisterView, ProfileView, AuthView, ChallengeView ) {

    // Extends Backbone.Router
    var FitnessRouter = Backbone.Router.extend( {

        // The Router constructor
        initialize: function() {

//            $('#header').html(new HeaderView().render().el);

            this.loginView = new LoginView( { el: "#login" } );
            this.challengeView = new ChallengeView( { el: "#create" } );
            this.registerView = new RegisterView( { el: "#register"} );
            this.authView = new AuthView( { el: "#auth" } );
            this.friendsView = new FriendsView( { el: "#friends" } );

            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();

        },

        // Backbone.js Routes
        routes: {
            "": "whereTo",
            "home": "home",
            "login" : "login",
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

        // Home method
        whereTo: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.login();
                    return;
                }
                if (fitness.user && fitness.user.get('accesstoken')) {
                    that.home();
                }
                else { // need to auth with Fitbit
                    if (window.location.href.indexOf('oauth_token') !== -1) { // user authorized on Fitbit and was redirected here
                        var requestToken = localStorage.getItem("request_token");
                        if (!requestToken) {
                            fitness.showMessage('Missing Fitbit request token.'); // need to start over with request token call
                            var footerView = new FooterView( { el: "#auth .footer"} );
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

                                this.home();

                                var footerView = new FooterView( { el: "#home .footer"} );
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
                        this.auth();
                    }
                }
            });
        },

        // Home method
        home: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.login();
                    return;
                }
                if (fitness.user && fitness.user.get('accesstoken')) {
                    //$.mobile.loading("show");
                    var footerView = new FooterView( { el: "#home .footer"} );
                    this.homeView = new HomeView( { el: "#home"} );
                    $.mobile.changePage( "#home" , { reverse: true, changeHash: true } );
                }
                else {
                    this.auth();
                }
            });
        },

        activeChallenges: function() {
            var footerView = new FooterView( { el: "#profile .footer"} );
            $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
        },

        profile: function() {
            //this.ensureLogin(function(success) {
                var footerView = new FooterView( { el: "#profile .footer"});
                this.profileView = new ProfileView( { el: "#profile" } );
                $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
            //});
        },

        login: function() {
            var footerView = new FooterView( { el: "#login .footer"} );
            $.mobile.changePage( "#login" , { reverse: false, changeHash: true } );
        },

        register: function() {
            var footerView = new FooterView( { el: "#register .footer" } );
            $.mobile.changePage( "#register" , { reverse: false, changeHash: true } );
        },

        auth: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.login();
                    return;
                }
                var footerView = new FooterView( { el: "#auth .footer" } );
                $.mobile.changePage( "#auth" , { reverse: false, changeHash: false } );
            });
        },

        create: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.login();
                    return;
                }
                var footerView = new FooterView( { el: "#create .footer" } );
                $.mobile.changePage( "#create" , { reverse: true, changeHash: true } );
            });
        },

        friends: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.login();
                    return;
                }
                var footerView = new FooterView( { el: "#friends .footer" } );
                $.mobile.changePage( "#friends" , { reverse: true, changeHash: false } );
            });
        }

    });

    // Returns the Router class
    return FitnessRouter;

} );