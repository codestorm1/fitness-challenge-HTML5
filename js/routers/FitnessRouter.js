define("routers/FitnessRouter", [ "jquery", "backbone", "mustache", "fitness", "customCodeClient", "models/ChallengeModel",
    "views/FooterView", "views/HomeView", "views/FriendsView", "views/LoginView", "views/RegisterView", "views/ProfileView", "views/AuthView",
    "views/CreateChallengeView", "views/ChallengeListView", "views/ChallengeView", "views/InvitationView", "views/InvitationListView", "jquerymobile" ],
    function( $, Backbone, Mustache, fitness, customCode, ChallengeModel,
              FooterView, HomeView, FriendsView, LoginView, RegisterView, ProfileView, AuthView,
              CreateChallengeView, ChallengeListView, ChallengeView, InvitationView, InvitationListView, $__jqm ) {

       // "use strict";
    // Extends Backbone.Router
    var FitnessRouter = Backbone.Router.extend( {
        // The Router constructor
        initialize: function() {
//            $('#header').html(new HeaderView().render().el);
//            this.invitationViews = [];
            this.loginView = new LoginView({el: "#login"});
            this.registerView = new RegisterView({el: "#register"});
            this.challengeViewLookup = {};
            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();
        },

        // Backbone.js Routes
        routes: {
            "": "whereTo",
            "home": "showHome",
            "login" : "showLogin",
            "challenge_list" : "showChallengeList",
            "challenge_:challenge_id" : "showChallenge",
            "invitation_list" : "showInvitationList",
            "invitation/:invitation_id" : "showInvitation",
            "create" : "showCreate",
            "profile" : "showProfile",
            "friends" : "showFriends",
            "register" : "showRegister",
            "auth" : "showAuth"
        },

        ensureLogin: function(callback) {
            fitness.log('ensuring user is logged in');
            if (fitness.isLoggedIn()) {
                callback(true);
                fitness.log('user is logged in');
                return;
            }
            var username = localStorage.getItem('username');
            if (!username) {
                fitness.log('user is not logged in');
                callback(false);
                return;
            }
            $.mobile.showPageLoadingMsg();
            fitness.log('logging in with ID');
            fitness.loginWithID(username, function(success) {
                fitness.log('login attempt complete: ' + success);
                fitness.log('updating if stale');
                fitness.updateIfStale(username, function(success, data) {
                    $.mobile.hidePageLoadingMsg();
                    if (!success) {
                        alert('failed to load your data');
                    }
                    fitness.log('update complete, calling callback');
                    callback(success);
                });
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
                            that.showAuth();
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
//                fitness.updateIfStale(username, function(success, data) {
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
//                });
            });
        },

        showChallengeList: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                var pageSelector = '#challenge_list';
                var footerSelector = pageSelector + ' .footer';
                function createAndShowView() {
                    if (!that.challengesView) {
                        that.challengesView = new ChallengeListView({el: pageSelector, model: fitness.challenges});
                        var footerView = new FooterView({el: footerSelector});
                    }
                    $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                }
                if (!fitness.challenges) {
                    $.mobile.showPageLoadingMsg();
                    fitness.getUserChallenges(fitness.user.get('username'), false, function(success, data) {
                        if (!success) {
                            fitness.showMessage('Failed to get challenges');
                            return;
                        }
                        createAndShowView();
                    });
                }
                else {
                    $(pageSelector + ' ul[data-role="listview"] a').removeClass('ui-btn-active');
                    createAndShowView();
                }
            });
        },

        showChallenge: function(challengeID) {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                var pageSelector = '#' + challengeID;
                var footerSelector = pageSelector + ' .footer';
                function ensureLeaders(challenge, callback) {
                    var leaders = challenge.get('leaders');
                    if (leaders) {
                        callback(true);
                        return;
                    }
                    fitness.decorateChallengeWithLeaders(challenge, function(success, challengeModel) {
                        if (!success) {
                            console.warn('failed to get leaderboard for challenge');
                            return;
                        }
                        callback(success, challengeModel);
                    });
                }

                function setView() {
                    if (!that.challengeViewLookup[challengeID]) {
                        var challenge = fitness.challengeLookup[challengeID];
                        var template = $('#challenge_wrapper_template');

                        var html = Mustache.to_html(template.html().trim(), {'challenge_id' : challengeID});
                        $(html).insertAfter('#challenge_list');
                        var challengeView = new ChallengeView({el: pageSelector, model: challenge});
                        var footerView = new FooterView({el: footerSelector});
                        that.challengeViewLookup[challengeID] = challengeView;
                    }
                    $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                };
                var challenge = fitness.challengeLookup[challengeID];
                if (challenge) {
                    ensureLeaders(challenge, function (success, model) {
                        if (!success) {
                            console.warn('could not ensure leaders');
                        }
                        setView();
                    });
                }
                else {
                    $.mobile.showPageLoadingMsg();
                    fitness.getChallenge(challengeID, function(success, model) {
                        $.mobile.hidePageLoadingMsg();
                        if (!success) {
                            fitness.showMessage('Failed to get challenge');
                            return;
                        }
                        ensureLeaders(model, function (success, leaders) {
                            if (!success) {
                                console.warn('could not ensure leaders');
                            }
                            setView();
                        });
                    });
                }
            });
        },

        showCreate: function() {
            var that = this;

            function fetchChallenges(callback) {

            }
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                function createAndShowView() {
                    that.createChallengeView = new CreateChallengeView( { el: "#create" } );
                    var footerView = new FooterView( { el: "#create .footer" } );
                    $.mobile.changePage( "#create" , { reverse: false, changeHash: true } );
                }
                if (!that.createChallengeView) {
                    $.mobile.showPageLoadingMsg();
                    if (!fitness.friends) {
                        fitness.getStackmobFriends(fitness.user.get('friends'), function(success, data) {
                            createAndShowView();
                        });
                    }
                    else {
                        createAndShowView();
                    }
                }
                else {
                    $.mobile.changePage( "#create" , { reverse: false, changeHash: true } );
                }
            });
        },

        showInvitationList: function() {
            var that = this;
            fitness.log('in show invitation list');
            this.ensureLogin(function(success) {
                    if (!success) {
                    that.showLogin();
                    return;
                }

                var pageSelector = '#invitation_list';
                var footerSelector = pageSelector + ' .footer';

                // todo fix this logic, is broken?
                function createAndShowView() {
                    fitness.log('create and show invitations');
                    if (!that.invitationsView) {
                        fitness.log('creating invitations view');
                        that.invitationsView = new InvitationListView({el: pageSelector, model: fitness.invitations});
                        var footerView = new FooterView({el: footerSelector});
                    }
                    $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                }
                if (!fitness.invitations) {
                    fitness.log('no invitations loaded, fetching invites');
                    $.mobile.showPageLoadingMsg();
                    fitness.getChallengeInvites(fitness.user.get('username'), function(success, data) {
                        if (!success) {
                            fitness.showMessage('Failed to load invitations');
                            return;
                        }
                        fitness.log('fetched invitations');
                        createAndShowView();
                    });
                }
                else {
                    fitness.log('invitations already loaded');
                    $(pageSelector + ' ul[data-role="listview"] a').removeClass('ui-btn-active');
                    createAndShowView();
                }
            });
        },

        showInvitation: function(invitationID) {
            var that = this;
            this.ensureLogin(function(success) {
                    if (!success) {
                    that.showLogin();
                    return;
                }
                var pageSelector = '#invitation';
                var footerSelector = pageSelector + ' .footer';
                function createAndShowView() {
                    that.invitationView = new InvitationView({el: "#invitation", model: fitness.invitationLookup[invitationID]});
                    var footerView = new FooterView({el: footerSelector});
                    $.mobile.changePage(pageSelector, {reverse: false, changeHash: true});
                }
                if (!fitness.invitations) {
                    $.mobile.showPageLoadingMsg();
                    fitness.getChallengeInvites(fitness.user.get('username'), function(success) {
                        if (!success) {
                            fitness.showMessage('Failed to load invitations');
                            return;
                        }
                        createAndShowView();
                    });
                }
                else {
                    createAndShowView();
                }
            });
        },


        showProfile: function() {
            var that = this;
            this.ensureLogin(function(success) {
                if (!success) {
                    that.showLogin();
                    return;
                }
                if (!that.profileView) {
                    that.profileView = new ProfileView( { el: "#profile", model: fitness.user } );
                    var footerView = new FooterView( { el: "#profile .footer"});
                    $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
                }
                else {
                    $.mobile.changePage( "#profile" , { reverse: false, changeHash: true } );
                }
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
                    $.mobile.changePage( "#auth" , { reverse: false, changeHash: true } );
                    $.mobile.showPageLoadingMsg();
                }
                else {
                    $.mobile.changePage( "#auth" , { reverse: false, changeHash: true } );
                    $.mobile.showPageLoadingMsg();
                }
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
                    $.mobile.showPageLoadingMsg();
                    fitness.updateFitbitFriends(fitness.user.get('username'), function(success, data) {
                        if (!success) {
                            console.debug('Failed to update fitbit friends');
                        }
                        fitness.getStackmobFriends(fitness.user.get('friends'), function(success, data) {
                            that.friendsView = new FriendsView( { el: "#friends", model: fitness.friends } );
                            var footerView = new FooterView( { el: "#friends .footer" } );
                            $.mobile.changePage( "#friends" , { reverse: false, changeHash: true } );
                        });
                    });
                }
                else {
                    $.mobile.changePage( "#friends" , { reverse: false, changeHash: true } );
                }
            });
        }

    });

    // Returns the Router class
    return FitnessRouter;

} );
