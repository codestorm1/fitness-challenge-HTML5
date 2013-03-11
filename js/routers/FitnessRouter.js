define("routers/FitnessRouter", [ "jquery", "backbone", "fitness", "customCodeClient", "models/ChallengeModel",
    "views/FooterView", "views/HomeView", "views/FriendsView", "views/LoginView", "views/RegisterView", "views/ProfileView", "views/AuthView",
    "views/ChallengeView", "views/ChallengeListView", "views/InvitationView", "views/InvitationListView", "jquerymobile" ],
    function( $, Backbone, fitness, customCode, ChallengeModel,
              FooterView, HomeView, FriendsView, LoginView, RegisterView, ProfileView, AuthView,
              ChallengeView, ChallengeListView, InvitationView, InvitationListView, $__jqm ) {

       // "use strict";
    // Extends Backbone.Router
    var FitnessRouter = Backbone.Router.extend( {


        // The Router constructor
        initialize: function() {

//            $('#header').html(new HeaderView().render().el);

//            this.invitationViews = [];
            this.loginView = new LoginView( { el: "#login" } );
            this.registerView = new RegisterView( { el: "#register"} );

            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();

        },

        // Backbone.js Routes
        routes: {
            "": "whereTo",
            "home": "showHome",
            "login" : "showLogin",
            "challenge_list" : "showChallengeList",
            "invitation_list" : "showInvitationList",
            "invitation/:invitation_id" : "showInvitation",
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
                            fitness.showMessage('Missing Fitbit request token.'); // need to start over with request token call on auth page
                            this.showAuth();
                        }
                        var requestTokenSecret = localStorage.getItem("request_token_secret");
                        var oauthVerifier = customCode.getQueryVariable(window.location.href, 'oauth_verifier');

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
                                window.location.href = '/#home'; // using location.href instead of router navigation to clear the query string
                            }
                            else {
                                localStorage.removeItem('request_token');
                                localStorage.removeItem('request_token_secret');
                                fitness.showMessage(data);
                            }
                        });
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
                var username = fitness.user.get('username');
                fitness.updateIfStale(username, function(success, data) {
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
            });
        },

        showChallengeList: function() {
            var that = this;
            var pageSelector = '#challenge_list';
            var footerSelector = pageSelector + ' .footer';
            this.ensureLogin(function(success) {
                if (!that.challengesView) {
                    customCode.getChallenges(fitness.user.get('username'), function(success, data) {
                        if (success) {
                            fitness.challenges = data;
                        }
                        else {
                            fitness.showMessage('Failed to get challenges');
                        }
                        that.challengesView = new ChallengeListView({el: pageSelector, model: fitness.challenges});
                        var footerView = new FooterView({el: footerSelector});
                        $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                        $.mobile.showPageLoadingMsg();
                    });
                }
                else {
                    $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                    $.mobile.showPageLoadingMsg();
                }
            });
        },

        showInvitationList: function() {
            var that = this;
            var pageSelector = '#invitation_list';
            var footerSelector = pageSelector + ' .footer';
            function changePage() {
                $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                $.mobile.showPageLoadingMsg();
            }

            this.ensureLogin(function(success) {
                if (!that.invitationsView) {
                    fitness.getInvitations(fitness.user.get('username'), false, function(success, data) {
                        if (!success) {
                            fitness.showMessage('Failed to load invitations');
                            return;
                        }
                        that.invitationsView = new InvitationListView({el: pageSelector, model: data});
                        var footerView = new FooterView({el: footerSelector});
                        changePage();
                    });
                }
                else {
                    changePage();
                }
            });
        },

        showInvitation: function(invitationID) {
            var that = this;
            var pageSelector = '#invitation';
            var footerSelector = pageSelector + ' .footer';
            this.ensureLogin(function(success) {
                var changePage = function() {
                    $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                    $.mobile.showPageLoadingMsg();
                };
                if (!that.invitationView) {
                    fitness.getInvitations(fitness.user.get('username'), true, function(success) {
                        if (!success) {
                            fitness.showMessage('Failed to load invitations');
                            return;
                        }
                        that.invitationView = new InvitationView({el: "#invitation", model: fitness.invitationLookup[invitationID]});
                        var footerView = new FooterView({el: footerSelector});
                        changePage();
                    });
                }
                else {
                    changePage();
                }
            });
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
                    fitness.updateFitbitFriends(fitness.user.get('username'), function(success, data) {
                        if (success) {
                            that.friendsView = new FriendsView( { el: "#friends" } );
                            var footerView = new FooterView( { el: "#friends .footer" } );
                            $.mobile.changePage( "#friends" , { reverse: false, changeHash: true } );
                            $.mobile.showPageLoadingMsg();
                        }
                    });
                }
                $.mobile.changePage( "#friends" , { reverse: false, changeHash: true } );
                $.mobile.showPageLoadingMsg();
            });
        }

    });

    // Returns the Router class
    return FitnessRouter;

} );
