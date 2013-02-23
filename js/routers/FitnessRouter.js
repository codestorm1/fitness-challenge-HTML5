<<<<<<< HEAD
define(["jquery","backbone","fitness","customCodeClient","models/ChallengeModel","views/FooterView","views/HomeView","views/FriendsView","views/LoginView","views/RegisterView","views/ProfileView","views/AuthView","views/ChallengeView","jquerymobile"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){var d=t.Router.extend({initialize:function(){this.loginView=new a({el:"#login"}),this.registerView=new f({el:"#register"}),t.history.start()},routes:{"":"whereTo",home:"showHome",login:"showLogin",create:"showCreate",profile:"showProfile",friends:"showFriends",register:"showRegister",auth:"showAuth"},ensureLogin:function(e){if(n.isLoggedIn()){e(!0);return}var t=localStorage.getItem("username");if(!t){e(!1);return}n.loginWithID(t,function(t){e(t);return})},whereTo:function(){var t=this;this.ensureLogin(function(i){if(!i){t.showLogin();return}if(n.user&&n.user.get("accesstoken"))t.showHome();else if(window.location.href.indexOf("oauth_token")!==-1){var o=localStorage.getItem("request_token");if(!o){n.showMessage("Missing Fitbit request token.");var u=new s({el:"#auth .footer"});e.mobile.loading("show"),this.showAuth();return}var a=localStorage.getItem("request_token_secret"),f=r.getQueryVariable(window.location.href,"oauth_verifier"),l=f.length-1;f[l]==="/"&&(f=f.substring(0,l).replace("#","")),r.completeFitbitAuth(n.user,o,a,f,function(r,i){if(r){var o=i;n.user.set("accesstoken",o.oauth_token),n.user.set("accesstokensecret",o.oauth_token_secret),n.user.set("fitbituserid",o.fitbit_user_id),localStorage.removeItem("request_token"),localStorage.removeItem("request_token_secret"),t.showHome();var u=new s({el:"#home .footer"});e.mobile.changePage("#home",{reverse:!1,changeHash:!0})}else localStorage.removeItem("request_token"),localStorage.removeItem("request_token_secret"),n.showMessage(i)})}else t.showAuth()})},showHome:function(){var t=this;this.ensureLogin(function(r){if(!r){t.showLogin();return}if(n.user&&n.user.get("accesstoken")){t.homeView=new o({el:"#home"});var i=new s({el:"#home .footer"});e.mobile.changePage("#home",{reverse:!0,changeHash:!0})}else t.showAuth()})},showActiveChallenges:function(){var t=new s({el:"#profile .footer"});e.mobile.changePage("#profile",{reverse:!1,changeHash:!0})},showProfile:function(){var t=this;this.ensureLogin(function(n){if(!t.profileView){t.profileView=new l({el:"#profile"});var r=new s({el:"#profile .footer"})}e.mobile.changePage("#profile",{reverse:!1,changeHash:!0})})},showLogin:function(){var t=new s({el:"#login .footer"});e.mobile.changePage("#login",{reverse:!1,changeHash:!0})},showRegister:function(){var t=new s({el:"#register .footer"});e.mobile.changePage("#register",{reverse:!1,changeHash:!0})},showAuth:function(){var t=this;this.ensureLogin(function(n){if(!n){t.showLogin();return}if(!t.authView){var r=new s({el:"#auth .footer"});t.authView=new c({el:"#auth"})}e.mobile.changePage("#auth",{reverse:!1,changeHash:!0})})},showCreate:function(){var t=this;this.ensureLogin(function(n){if(!n){t.showLogin();return}if(!t.challengeView){t.challengeView=new h({el:"#create"});var r=new s({el:"#create .footer"})}e.mobile.changePage("#create",{reverse:!0,changeHash:!0})})},showFriends:function(){var t=this;this.ensureLogin(function(n){if(!n){t.showLogin();return}if(!t.friendsView){t.friendsView=new u({el:"#friends"});var r=new s({el:"#friends .footer"})}e.mobile.changePage("#friends",{reverse:!0,changeHash:!0})})}});return d});
=======
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
                            var footerView = new FooterView( { el: "#auth .footer"} );
                            $.mobile.loading("show");
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
                }
                else {
                    that.showAuth();
                }
            });
        },

        showActiveChallenges: function() {
            var footerView = new FooterView( { el: "#profile .footer"} );
            $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
        },

        showProfile: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!that.profileView) {
                    that.profileView = new ProfileView( { el: "#profile" } );
                    var footerView = new FooterView( { el: "#profile .footer"});
                }
                $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
            });
        },

        showLogin: function() {
            var footerView = new FooterView( { el: "#login .footer"} );
            $.mobile.changePage( "#login" , { reverse: false, changeHash: true } );
        },

        showRegister: function() {
            var footerView = new FooterView( { el: "#register .footer" } );
            $.mobile.changePage( "#register" , { reverse: false, changeHash: true } );
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
            });
        }

    });

    // Returns the Router class
    return FitnessRouter;

} );
>>>>>>> mainly jqm fix to get nav bars always working, and also style a clicked link
