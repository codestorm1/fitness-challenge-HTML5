define([ "jquery", "backbone", "fitness", "customCodeClient", "models/ChallengeModel", "views/FooterView", "views/HomeView", "views/FriendsView", "views/LoginView", "views/RegisterView", "views/ProfileView", "views/AuthView", "views/ChallengeView", "jquerymobile" ],
    function( $, Backbone, fitness, customCode, ChallengeModel, FooterView, HomeView, FriendsView, LoginView, RegisterView, ProfileView, AuthView, ChallengeView,$__jqm ) {

//define([ "jquery", "backbone", "../fitness", "../views/FooterView", "../views/HomeView", "jquerymobile" ],
//    function( $, Backbone, fitness, FooterView, HomeView) {

       // "use strict";
    // Extends Backbone.Router
    var FitnessRouter = Backbone.Router.extend( {


        // The Router constructor
        initialize: function() {

//            $('#header').html(new HeaderView().render().el);

            var that = this;
            this.loginView = new LoginView( { el: "#login" } );
            this.registerView = new RegisterView( { el: "#register"} );
//            if (!this.friendsView) {
//                this.friendsView = new FriendsView( { el: "#friends" } );
//                var footerView = new FooterView( { el: "#friends .footer" } );
//            }

            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();

        },

        // Backbone.js Routes
        routes: {
            "": "whereTo",
            "home": "showHome",
            "login" : "showLogin",
            "create" : "showCreate",
            "profile" : "showProfile",
            "friends" : "showFriends",
            "register" : "showRegister",
            "auth" : "showAuth"
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
                    that.showLogin();
                    return;
                }
                if (fitness.user && fitness.user.get('accesstoken')) {
                    that.showHome();
                }
                else { // need to auth with Fitbit
                    if (window.location.href.indexOf('oauth_token') !== -1) { // user authorized on Fitbit and was redirected here
                        var requestToken = localStorage.getItem("request_token");
                        if (!requestToken) {
                            fitness.showMessage('Missing Fitbit request token.'); // need to start over with request token call
                            this.showAuth();
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
                                that.showHome();
                            }
                            else {
                                localStorage.removeItem('request_token');
                                localStorage.removeItem('request_token_secret');
                                fitness.showMessage(data);
                            }
                        })
                    }
                    else {
                        that.showAuth();
                    }
                }
            });
        },

        // Home method
        showHome: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                if (fitness.user && fitness.user.get('accesstoken')) {
                    that.homeView = new HomeView( { el: "#home"} );
                    var footerView = new FooterView( { el: "#home .footer"} );
                    $.mobile.changePage( "#home" , { reverse: true, changeHash: true } );
//                    var activePage = $.mobile.activePage[0].id;
//                    if (activePage != "home" && activePage != '') {
//                    }
                }
                else {
                    that.showAuth();
                }
            });
        },

        showActiveChallenges: function() {
            var footerView = new FooterView( { el: "#profile .footer"} );
            $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
            $.mobile.showPageLoadingMsg();
        },

        showProfile: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!that.profileView) {
                    that.profileView = new ProfileView( { el: "#profile" } );
                    var footerView = new FooterView( { el: "#profile .footer"});
                }
                $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
                $.mobile.showPageLoadingMsg();
            });
        },

        showLogin: function() {
            var footerView = new FooterView( { el: "#login .footer"} );
            $.mobile.changePage( "#login" , { reverse: false, changeHash: true } );
            $.mobile.showPageLoadingMsg();
        },

        showRegister: function() {
            var footerView = new FooterView( { el: "#register .footer" } );
            $.mobile.changePage( "#register" , { reverse: false, changeHash: true } );
            $.mobile.showPageLoadingMsg();
        },

        showAuth: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                if (!that.authView) {
                    var footerView = new FooterView( { el: "#auth .footer" } );
                    that.authView = new AuthView( { el: "#auth" } );
                }
                $.mobile.changePage( "#auth" , { reverse: false, changeHash: true } );
                $.mobile.showPageLoadingMsg();
            });
        },

        showCreate: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                if (!that.challengeView) {
                    that.challengeView = new ChallengeView( { el: "#create" } );
                    var footerView = new FooterView( { el: "#create .footer" } );
                }
                $.mobile.changePage( "#create" , { reverse: false, changeHash: true } );
                $.mobile.showPageLoadingMsg();
            });
        },

        showFriends: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                if (!that.friendsView) {
                    that.friendsView = new FriendsView( { el: "#friends" } );
                    var footerView = new FooterView( { el: "#friends .footer" } );
                }
                $.mobile.changePage( "#friends" , { reverse: false, changeHash: true } );
                $.mobile.showPageLoadingMsg();
            });
        }

    });

    // Returns the Router class
    return FitnessRouter;

} );
