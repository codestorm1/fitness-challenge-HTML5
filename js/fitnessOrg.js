//"use strict";
var fitness = fitness || {

    getQueryVariable: function (url, key) {
        var query = url.split("?");
        if (query.length > 1) {
            var vars = query[1].split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == key) {
                    return pair[1];
                }
            }
        }
        return null;
    },

    parseDate: function(dateStr) {
        var parts = dateStr.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    },

    getTemplateTarget: function (templateElement) {
        if (templateElement[0]) {
            return templateElement.data("target-element");
        }
    },

    renderTemplate: function (templateSelector, dto, doAppend, target) {
        var template = $(templateSelector);
        if (template[0]) {
            var html = Mustache.to_html(template.html(), dto || {});
            if (!target) {
                var targetSelector = template.data("target-element");
                target = $(targetSelector);
            }
            if (target[0]) {
                if (doAppend) {
                    target.append(html);
                }
                else {
                    target.html(html);
                }
                return targetSelector;
            }
        }
    },

    showMessage : function(message) {
        alert(message);
    },

    getNextUserID : function(callback) {
        var UserIDCounter = StackMob.Model.extend({ schemaName: 'user_id_counter' });
        var counter = new UserIDCounter({'user_id_counter_id' : '1'});
        counter.fetch({
            success: function(model) {
                model.incrementOnSave('current_id', 1); // the field will be incremented by 1
                model.save({}, {
                    success: function(model) {
                        if (typeof callback === "function") {
                            if (model.attributes && model.attributes.current_id) {
                                callback(true, model.attributes.current_id);
                            }
                            else {
                                callback(false);
                            }
                        }

                    },
                    error: function(model, response) {
                        // response['error'] is the container for our error message
                        console.debug("Aww...why did you fail on me?! " + response['error']);
                        if (typeof callback === "function") {
                            callback(false);
                        }
                    }
                });
            },
            error: function(model, response) {
                console.debug(response);
                if (typeof callback === "function") {
                    callback(false);
                }
            }
        });
    },

    getFitbitRequestToken : function(userID, callback) {
        StackMob.customcode('fetch_fitbit_request_token', {'stackmob_user_id' : userID}, {
            success: function(tokens) {
                //jsonResult is the JSON object: { "msg": "Hello, world!" }
                localStorage.setItem('request_token', tokens.oauth_token);
                localStorage.setItem('request_token_secret', tokens.oauth_token_secret);
                if (typeof callback === "function") {
                    callback(true, tokens)
                }
            },
            error: function(data) {
                if (typeof callback === "function") {
                    callback(false, data)
                }
            }
        });
    },

    getFitbitAccessToken : function(callback, params) {
        var that = this;
        var requestToken = localStorage.getItem("request_token");
        var requestTokenSecret = localStorage.getItem("request_token_secret");
        var oauthVerifier = this.getQueryVariable(window.location.href, 'oauth_verifier');

        var pos = oauthVerifier.length - 1;
        if (oauthVerifier[pos] === '/') { // stackmob mistakenly adds a slash to the URL, so remove it
            oauthVerifier = oauthVerifier.substring(0, pos).replace('#',''); // also kill a # if there is one
        }
        var results;
        var params = {
            "request_token" : requestToken,
            "request_token_secret" : requestTokenSecret,
            "oauth_verifier" : oauthVerifier
        };

        StackMob.customcode('fetch_fitbit_access_token', params, 'GET', {
            success: function(accessTokenData) {

//                localStorage.setItem('access_token', accessTokenData.oauth_token);
//                localStorage.setItem('accesstokensecret', accessTokenData.oauth_token_secret);
//                localStorage.setItem('fitbit_user_id', accessTokenData.fitbit_user_id);
                that.user.accesstoken =  accessTokenData.oauth_token;
                that.user.accesstokensecret = accessTokenData.oauth_token_secret;
                that.user.fitbituserid = accessTokenData.fitbit_user_id;
                localStorage.removeItem('request_token');
                localStorage.removeItem('request_token_secret');
                if (typeof callback === "function") {
                    callback(true, params, accessTokenData);
                }
            },

            error: function(jsonResult) {
                if (typeof callback === "function") {
                    callback(false, params, jsonResult);
                }
            }
        });
    },

    getFitbitUser : function(callback) {

        var params = {
            "access_token" : this.user.accesstoken,
            "access_token_secret" : this.user.accesstokensecret,
            "fitbit_user_id" : this.user.fitbituserid
        };
        StackMob.customcode('fetch_fitbit_user', params, 'GET', {
            success: function(jsonResult) {
                var userInfoResponse = jsonResult['userInfoJson'];
                var user = JSON.parse(userInfoResponse)['user'];
                if (typeof callback === "function") {
                    callback(true, user);
                }
            },

            error: function(errorData) {
                if (typeof callback === "function") {
                    callback(false, errorData);
                }
            }
        });
    },

    lookupFitnessUser : function(email, password, callback) {
        var that = this;
        if (!email) {
            if (typeof callback === 'function') {
                callback(false, 'email address is required');
            }
            return;
        }
        var User = StackMob.Model.extend({ schemaName: 'user' });
        var Users = StackMob.Collection.extend({ model: User });
        var users = new Users();
        var q = new StackMob.Collection.Query();
        q.equals('email', email);
        if (password) {
            q.equals('fc_password', password);
        }
        users.query(q, {
            success: function(model) {
                if (model.models.length > 0 && model.models[0].attributes) {
                    if (typeof callback === 'function') {
                        callback(true, model.models[0].attributes);
                    }
                }
                else {
                    if (typeof callback === 'function') {
                        callback(false, 'Could not find user with given email and password');
                    }
                }
            },
            error: function(response) {
                that.showMessage('query failed trying to get user ' + response);
                console.debug(response);
                if (typeof callback === 'function') {
                    callback(false, response);
                }
            }
        });
    },

    createStackmobUser : function(email, password, callback) {
        var that = this;
        //var User = StackMob.Model.extend({ schemaName: 'user' });
        //var user = new User(fitbitUser);

        this.lookupFitnessUser(email, password, function(success, data) {
            if (success) {
                that.showMessage('That email address is already in use');
                return;
            }
            that.getNextUserID(function(success, currentUserID) {
                if (success) {
                    var regInfo = {
                        "email" : email,
                        "password" : password,
                        "fc_password" : password,
                        "username" : currentUserID.toString()
                        };

                    var user = new StackMob.User(regInfo);
                    user.create({
                        success: function(model) {
                            console.debug('user object is saved');
                            fitness.user = model.attributes;
                            localStorage.setItem('username', currentUserID);
                            callback(true, model);
                        },
                        error: function(model, response) {
                            console.debug(response);
                            callback(false, 'failed to save user to datastore');
                        }
                    });
                }
                else {
                    callback(false, 'Failed to get next StackMob user ID');
                }
            });
        });
    },

    updateUserWithParams : function(fitbitUser, callback) {

        delete fitbitUser.encodedid;
        $.extend(this.user, fitbitUser);

        var user = new StackMob.User({ username : this.user.username });
        user.save(this.user, {
            success: function(model) {
                console.debug(model.toJSON());
                if (typeof callback === "function") {
                    callback(true, model);
                }
            },
            error: function(model, response) {
                console.debug(response);
                if (typeof callback === "function") {
                    callback(false, response);
                }
            }
        });
    },

    getFitbitFriends : function(username, callback) {
        var that = this;
        var results;
        StackMob.customcode('fetch_fitbit_friends', {"stackmob_user_id" : username}, 'GET', {
            success: function(jsonResult) {
                results = 'got friends!<br/>\n';
                var friendsResponse = jsonResult['friendsJson'];
                var friends = JSON.parse(friendsResponse)['friends'];

                if (typeof callback === "function") {
                    callback(true, friends);
                }
            },

            error: function(response) {
                that.showMessage('failed to get your Fitbit friends');
                if (typeof callback === "function") {
                    callback(false, response);
                }
            }
        });
    },

    // not used now, for debugging
    showFriends : function(friends) {
        var friendsHTML = '';
        var len = friends.length;
        var friend;
        for (var i = 0; i < len; i++) {
            friend = friends[i]['user'];
            for (var key in friend) {
                friendsHTML += key + ": " + friend[key] + '<br>\n';
            }
        }
        $('#results').html(friendsHTML);
    },

    getFriends : function(callback) {
        if (this.user.friends) {

        }

    },

    saveFriendsToStackmob : function(friends) {
        var that = fitness;
        var fitbitUserIDs = [];
        var len = friends.length;
        for (var i = 0; i < len; i++) {
            var friend = friends[i]['user'];
            fitbitUserIDs.push(friend['encodedId']);
        }

        var User = StackMob.Model.extend({ schemaName: 'user' });
        var Users = StackMob.Collection.extend({ model: User });
        var users = new Users();

        var friendsQuery = new StackMob.Collection.Query();
        friendsQuery.mustBeOneOf('fitbituserid', fitbitUserIDs);
        users.query(friendsQuery, {
            success: function(friends) {
                var stackmobFriendIDs = [];
                if (friends.models.length > 0 && friends.models[0].attributes) {
                    len = friends.models.length;
                    for (var i = 0; i < len; i++) {
                        var friend = friends.models[i].attributes;
                        stackmobFriendIDs.push(friend['username']);
                    }
                }
                var user = new StackMob.User({ username : that.user.username });
                var params = {
                    "friends" : stackmobFriendIDs,
                    "friendcount" : stackmobFriendIDs.length,
                    "fitbitfriendcount" : fitbitUserIDs.length
                };
                user.save(params, {
                    success: function(model) {
                        console.debug(model.toJSON());
                        if (typeof callback === "function") {
                            callback(true, model);
                        }
                    },
                    error: function(model, response) {
                        console.debug(response);
                        if (typeof callback === "function") {
                            callback(false, response);
                        }
                    }
                });
            },
            error: function(repsonse) {

            }
        });
    },

    formatDate : function(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1; //Months are zero based
        var year = date.getFullYear();
        var dateStr = month + "/" + day  + "/" + year;
        return dateStr;
    },

    updateActivities : function(callback) {
        var today = new Date();
        var lastWeek = new Date(today.getTime() - 6*24*60*60*1000);

        var params = {
            "stackmob_user_id" : this.user.username,
            "start_date" : this.formatDate(lastWeek),
            "end_date" : this.formatDate(today)
        };
        StackMob.customcode('update_fitbit_activities', params, {
            success: function(tokens) {
                if (typeof callback === "function") {
                    callback(true, tokens)
                }
            },
            error: function(data) {
                if (typeof callback === "function") {
                    callback(false, data)
                }
            }
        });
    },

    completeFitbitAuth : function() {
        var that = this;
        this.getFitbitAccessToken(function(success) {
            if (success) {
                if (that.user) {
                    that.getFitbitUser(function(success, data) {
                        if (success) {
                            that.user.fitbituserid = data.encodedId;
                            that.updateUserWithParams(data, function(success, data) {
                                if (success) {
                                    window.location.href = '/#home';
                                }
                                else {

                                    that.showMessage('failed to update with fitbit info\n ' + data.error);
                                }
                            });
                        }
                        else {
                            that.showMessage("failed to get Fitbit User: " + data);
                        }
                    });
                }
            }
            else {
                that.showMessage("failed to get Fitbit access token");
            }
        });
    },

    loginWithID : function(username, callback) {
        var that = this;
        if (username) {
            var user = new StackMob.User({ username: username });
            user.fetch({
                success: function(model) {
                    that.user = model.attributes;
                    if (typeof callback === "function") {
                        callback(true, model);
                    }
                },
                error: function(data) {
                    that.showMessage('Could not retrieve your user data');
                    if (typeof callback === "function") {
                        callback(false, data);
                    }
                }
            });
        }
    },

    getChallengeInvites : function(callback) {

        var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
        var Invitations = StackMob.Collection.extend({ model: Invitation });
        var invitations = new Invitations();
        var q = new StackMob.Collection.Query();
        q.equals('inviteduser', this.user.username);
        q.equals('responded', false);
        invitations.query(q, {
            success: function(model) {
                var len = model.models.length;
                if (len === 0) {
                    if (typeof callback === 'function') {
                        callback(false, model);
                    }
                    return;
                }
                for (var i = 0; i < len; i++) {
                    var invite = model.models[i].attributes;

                    var Challenge = StackMob.Model.extend({ schemaName: 'challenge', "challenge_id" : invite.challenge_id });
                    var challenge = new Challenge();
                    challenge.fetch( {
                        success: function(model) {
                            var chal = model.attributes[0];
                            alert('you have a challenge invitation from ' + chal.challengecreator + '!');
                            console.debug(model.toJSON());
                        },
                        error: function(model, response) {
                            console.debug(response);
                        }
                    });

                }
            },
            error: function(response) {
                that.showMessage('query failed trying to get user ' + response);
                console.debug(response);
                if (typeof callback === 'function') {
                    callback(false, response);
                }
            }
        });

    },

    bindEvents : function() {
        var that = this;

        $('#register_submit').live('click', function() {
            var email = $("#register_email").val();
            var newPassword = $('#new_password').val();
            var confirmPassword = $('#confirm_password').val();
            if (newPassword !== confirmPassword) {
                that.showMessage("Passwords do not match");
                return;
            }
            that.createStackmobUser(email, newPassword, function(success, data) {
                if (success) {
                    window.location.href = '/#auth';
                }
                else {
                    that.showMessage('Failed to save user:\n' + data);
                }
            });
        });

//        $('#login_submit').live('click', function() {
//            var email = $("#email").val();
//            var password = $('#password').val();
//            that.lookupFitnessUser(email, password, function(success, data) {
//                if (success) { // logged in
//                    that.user = data;
//                    localStorage.setItem('username', that.user.username);
//                    window.location.href = '/#home';
//                }
//                else {
//                    that.showMessage('login failed\n ' + data);
//                }
//            });
//        });

        $('#create_challenge_submit').live('click', function() {
            var challengeType = $("#challenge_type").val();

            var startDateStr = $('#start_date').val();
            var endDateStr = $('#end_date').val();

            var startDate = that.parseDate(startDateStr);
            var endDate = that.parseDate(endDateStr);

            var challengeID = that.user.username + '_' + challengeType + '_' + startDateStr + '_' + endDateStr;

            var Challenge = StackMob.Model.extend({ schemaName: 'challenge'});
            var challenge = new Challenge( {
                                             "challenge_id" : challengeID,
                                             "challengetype" : challengeType,
                                             "startdate" : startDate.getTime(),
                                             "enddate" : endDate.getTime(),
                                             "challengecreator" : that.user.username,
                                             "users" : [that.user.username]});
            challenge.create({
                success: function(model) {
                    if (that.user.friends) {
                        var friendIDs = that.user.friends;
                        var challenge_id = model.attributes.challenge_id;
                        var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
                        var len = friendIDs.length;
                        for (var i = 0; i < len; i++) {
                            var friendID = friendIDs[i];
                            var invitation = new Invitation({
                                "challenge" : challengeID,
                                "challengeinviter" : that.user.username,
                                "inviteduser" : friendID,
                                "responded" : false,
                                "accepted" : false});
                            invitation.create({
                                success: function(model) {
                                    that.showMessage("invitation to " + model.get('inviteduser') + " saved");
                                },
                                error: function(model) {
                                    that.showMessage("invitation to " + model.get('inviteduser') + " failed");
                                }
                            });
                        }
                    }
                },
                error: function(model, response) {
                    console.debug("Save challenge failed: " + response['error']);
                    if (response.error.indexOf('Duplicate') !== -1) {
                        that.showMessage("You've already created that challenge");
                    }
                    if (typeof callback === "function") {
                        callback(false);
                    }
                }
            });
        });

        $(document).bind("mobileinit", function () {
            $.mobile.ajaxEnabled = false;
            $.mobile.linkBindingEnabled = false;
            $.mobile.hashListeningEnabled = false;
            $.mobile.pushStateEnabled = false;
        });

        $('div[data-role="page"]').live('pagehide', function (event, ui) {
            $(event.currentTarget).remove();
        });

    },

    init : function() {

        var that = this;

        this.bindEvents();

        this.AppRouter = Backbone.Router.extend({

            routes:{
                "" : "home",
                "home" : "home",
                "login" : "showLogin",
                "logout" : "logout",
                "register" : "register",
                "auth" : "auth",
                "create" : "create"

            },

            changePage : function (page) {
                //return;
                //$(page.el).attr('data-role', 'page');
                page.render();
                $('#main').append($(page.el));
                $.mobile.changePage($(page.el), {changeHash:false});
            },


//            changePage:function (page) {
//                $(page.el).attr('data-role', 'page');
//                page.render();
//                $('body').append($(page.el));
//                $.mobile.changePage($(page.el), {changeHash:false});
//            }

            home : function () {
                if (!that.user) {
                    this.changePage(new that.LoginView());
                    return;
                }

                this.changePage(new that.HomeView());
            },

            showLogin : function() {
                this.changePage(new that.LoginView());
            },


            logout: function() {
                localStorage.clear();
                this.changePage(new that.LoginView());
            },

            register: function() {
                this.changePage(new that.RegisterView());
            },

            auth: function() {
                this.changePage(new that.AuthView());
            },

            create: function() {
                this.changePage(new that.CreateChallengeView());
            }


        });

        var router = new this.AppRouter();
        Backbone.history.start();
        router.navigate();
//        if (this.user.username && this.displayName) {
//            this.homeView = new this.HomeView();
//        }
//        else {
//        }

    }
};

$(function() {
    if (window.location.href.indexOf('stackmobapp.com') !== -1) {
        StackMob.init({ // production
            appName: "fitnesschallenge",
            clientSubdomain: "twistedogregmailcom",
            publicKey: "eb6421b3-9737-4f0b-97ce-8aebc448739b",
            apiVersion: 2
        });
    }
    else {
        StackMob.init({ // dev
            appName: "fitnesschallenge",
            clientSubdomain: "twistedogregmailcom",
            publicKey: "ba025b72-92db-4681-9abb-231baca5a94d",
            apiVersion: 0
        });
    }
    var username = localStorage.getItem('username');
    if (username) {
        fitness.loginWithID(username, function() {
            fitness.init();
            return;
        });
    }
    else {
        fitness.init();
    }
});
