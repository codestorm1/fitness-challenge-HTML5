define("customCodeClient", ["jquery"], function($) {
    // private methods
    var that = this;


    return {
    formatDate : function(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1; //Months are zero based
        var year = date.getFullYear();
        var dateStr = month + "/" + day  + "/" + year;
        return dateStr;
    },

    getQueryVariable : function (url, key) { // TODO move getQueryVariable to another js lib
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
                                var currentId = model.get('current_id');
                                if (currentId) {
                                    callback(true, currentId);
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
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            StackMob.customcode('fetch_fitbit_request_token', {'stackmob_user_id' : userID}, {
                success: function(tokens) {
                    callback(true, tokens)
                },
                error: function(data) {
                    callback(false, data)
                }
            });
        },

        getFitbitAccessToken : function(requestToken, requestTokenSecret, oauthVerifier, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }

            var params = {
                "request_token" : requestToken,
                "request_token_secret" : requestTokenSecret,
                "oauth_verifier" : oauthVerifier
            };

            StackMob.customcode('fetch_fitbit_access_token', params, 'GET', {
                success: function(accessTokenData) {
                    callback(true, accessTokenData);
                },

                error: function(jsonResult) {
                    callback(false, jsonResult);
                }
            });
        },

        getFitbitUser : function(accessToken, accessTokenSecret, fitbitUserID, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }

            var params = {
                "access_token" : accessToken,
                "access_token_secret" : accessTokenSecret,
                "fitbit_user_id" : fitbitUserID
            };
            StackMob.customcode('fetch_fitbit_user', params, 'GET', {
                success: function(jsonResult) {
                    var userInfoResponse = jsonResult['userInfoJson'];
                    var user = JSON.parse(userInfoResponse)['user'];
                    callback(true, user);
                },

                error: function(errorData) {
                    callback(false, errorData);
                }
            });
        },

        lookupFitnessUser : function(email, password, callback) {
            if (typeof callback !== 'function') {
                throw 'callback is required';
            }

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
                    if (model.length == 1) {
                        callback(true, model.models[0]);
                    }
                    else {
                        callback(false, 'Could not find user with given email and password');
                    }
                },
                error: function(response) {
                    that.showMessage('query failed trying to get user ' + response);
                    console.debug(response);
                    callback(false, response);
                }
            });
        },

        createStackmobUser : function(email, password, callback) {
            var that = this;
            if (typeof callback !== "function") {
                callback = function() {};
            }
            that.lookupFitnessUser(email, password, function(success, data) {
                if (success) {
                    callback(false, 'That email address is already in use');
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

        updateUserWithParams : function(stackMobUser, params, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }

            delete params.encodedid;
            for (var prop in params) {
                if (params.hasOwnProperty(prop)) {
                    stackMobUser.set(prop, params[prop]);
                }
            }

            var user = new StackMob.User({ username : stackMobUser.get('username') });
            user.save(stackMobUser, {
                success: function(model) {
                    callback(true, model);
                },
                error: function(model, response) {
                    console.debug(response);
                    callback(false, response);
                }
            });
        },

        getFitbitFriends : function(username, callback) {
            var that = this;
            StackMob.customcode('fetch_fitbit_friends', {"stackmob_user_id" : username}, 'GET', {
                success: function(jsonResult) {
                    var friendsResponse = jsonResult['friendsJson'];
                    var friends = JSON.parse(friendsResponse)['friends'];

                    if (typeof callback === "function") {
                        callback(true, friends);
                    }
                },

                error: function(response) {
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
            if (this.user.get('friends')) {

            }

        },

        saveFriendsToStackmob : function(username, friends, callback) { // TODO change list of friends to a backbone collection
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            if (!friends) {
                callback(false, 'no friends to update');
            }

            var that = this;
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
                    if (friends.models.length > 0) {
                        len = friends.models.length;
                        for (var i = 0; i < len; i++) {
                            var friend = friends.models[i];
                            stackmobFriendIDs.push(friend.get('username'));
                        }
                    }
                    var user = new StackMob.User({ username : username });
                    var params = {
                        "friends" : stackmobFriendIDs,
                        "friendcount" : stackmobFriendIDs.length,
                        "fitbitfriendcount" : fitbitUserIDs.length
                    };
                    user.save(params, {
                        success: function(model) {
                            callback(true, model);
                        },
                        error: function(model, response) {
                            console.debug(response);
                            callback(false, response);
                        }
                    });
                },
                error: function(repsonse) {
                    console.debug(response);
                    callback(false, response);
                }
            });
        },

        updateActivities : function(username, callback) {
            var today = new Date();
            var lastWeek = new Date(today.getTime() - 6*24*60*60*1000);

            var params = {
                "stackmob_user_id" : username,
                "start_date" : this.formatDate(lastWeek),
                "end_date" : this.formatDate(today)
            };
            StackMob.customcode('update_fitbit_activities', params, {
                success: function(tokens) {
                    console.debug('tokens response: ' + JSON.stringify(tokens));
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

        completeFitbitAuth : function(stackMobUser, requestToken, requestTokenSecret, oauthVerifier, callback) {
            var that = this;
            this.getFitbitAccessToken(requestToken, requestTokenSecret, oauthVerifier, function(success, tokenData) {
                if (success) {
//                    if (that.user) {
                        that.getFitbitUser(tokenData.oauth_token, tokenData.oauth_token_secret, tokenData.fitbit_user_id, function(success, fitbitUserData) {
                            if (success) {
                                console.debug('get fitbit user response: ' + JSON.stringify(fitbitUserData));
                                delete fitbitUserData.encodedID;
                                var params = fitbitUserData;
                                params.accesstoken =  tokenData.oauth_token;
                                params.accesstokensecret = tokenData.oauth_token_secret;
                                params.fitbituserid = tokenData.fitbit_user_id;

                                that.updateUserWithParams(stackMobUser, params, function(success, stackMobUserData) {
                                    if (success) {
                                        callback(true, stackMobUserData);
                                    }
                                    else {
                                        callback(false, 'failed to update with fitbit info\n ' + stackMobUserData.error);
                                    }
                                });
                            }
                            else {
                                callback(false, 'failed to get Fitbit User: ' + fitbitUserData);
                            }
                        });
//                    }
                }
                else {
                    callback(false, 'failed to get Fitbit access token');
                }
            });
        },

        loginWithID : function(username, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            if (username) {
                var user = new StackMob.User({ username: username });
                user.fetch({
                    success: function(model) {
                        console.debug('login response: ' + JSON.stringify(model.toJSON()));
                        callback(true, model);
                    },
                    error: function(data) {
                        callback(false, 'could not retrieve your data' + data);
                    }
                });
            }
        },

        getChallengeInvites : function(username, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
            var Invitations = StackMob.Collection.extend({ model: Invitation });
            var invitations = new Invitations();
            var q = new StackMob.Collection.Query();
            q.equals('inviteduser', username);
            q.equals('responded', false);
            q.setExpand(1);
            invitations.query(q, {
                success: function(model) {
                    var len = model.models.length;
                    console.debug('invitation response: ' + JSON.stringify(model.toJSON()));
                    if (len === 0) {
                        callback(true, model);
                        return;
                    }


                    // TODO: move this into a separate call?
//                    for (var i = 0; i < len; i++) {
//                        var invite = model.models[i];
//                        var Challenge = StackMob.Model.extend({ schemaName: 'challenge', "challenge_id" : invite.challenge_id });
//                        var challenge = new Challenge();
//                        challenge.fetch( {
//                            success: function(model) {
//                                callback(true, model);
//                            },
//                            error: function(model, response) {
//                                console.debug(response);
//                                callback(true, response);
//                            }
//                        });
//                    }
                    callback(true, model);
                },
                error: function(model, response) {
                    that.showMessage('query failed trying to get user ' + response);
                    console.debug(response);
                    callback(false, response);
                }
            });
        },

        getChallenges : function(username, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            var Challenge = StackMob.Model.extend({ schemaName: 'challenge' });
            var Challenges = StackMob.Collection.extend({ model: Challenge });
            var challenges = new Challenges();
            var q = new StackMob.Collection.Query();
            q.mustBeOneOf('users', username);
            challenges.query(q, {
                success: function(model) {
                    console.debug('challenges response: ' + JSON.stringify(model.toJSON()));
                    callback(true, model);
                },
                error: function(response) {
                    console.debug(response);
                    callback(false, response);
                }
            });
        }


    }
});

