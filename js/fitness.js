define("fitness", ["jquery", "stackmobinit", "customCodeClient",
    "collections/InvitesCollection" //,"collections/ChallengesCollection", "collections/LeadersCollection", "collections/UsersCollection"
],
    function($, __SI, customCode,
        InvitesCollection //, Challenges, Leaders, Users
        ) {
    //"use strict";

    return {
        parseUTCDate : function(dateStr) {
            var parts = dateStr.match(/(\d+)/g);
            // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
            return Date.UTC(parts[0], parts[1]-1, parts[2]); // months are 0-based
        },

        formatDateRangeDescription : function(startDate, endDate) {
            //var minutesOff = startDate.getTimezoneOffset();
            startDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
            endDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
            var momentStart = moment(startDate);
            var momentEnd = moment(endDate);
            var days = (endDate.getTime() - startDate.getTime()) / (1000*60*60*24) + 1;
            var dayText = (days == 1) ? ' day' : ' days';
            var description = 'Total steps ' + momentStart.calendar() + ' to ' + momentEnd.calendar() + ' (' + days + dayText + ')';
            description = description.replace(/at 12:00 AM/g, "");
            return description;
        },

        showMessage : function(message) {
            alert(message);
        },

        log : function(message) {
            if (console && typeof console.log === 'function') {
                console.log(message);
            }
        },

        isLoggedIn: function() {
            return !!this.user;
        },

        logout : function() {
            localStorage.removeItem('username');
            delete this.user;
        },

        deleteUser : function(callback) {
            var that = this;
            this.user.destroy({
                success: function(data) {
                    that.logout();
                    callback(true, data);
                },
                error: function(data) {
                    callback(false, data);
                }
            });
        },

        loginWithID : function(username, callback) {
            var that = this;
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            if (!username) {
                callback(false);
                return;
            }

            var sm_user = new StackMob.User({ username: username });
            sm_user.fetch({
                success: function(model) {
                    that.user = model;
                    callback(true, model);
                },
                error: function(data) {
                    that.showMessage('Could not retrieve your user data');
                    callback(false, data);
                }
            });
        },

        updateFitbitFriends : function(username, callback) {
            var that = this;
            customCode.getFitbitFriends(username, function(success, friends) {
                if (!success) {
                    that.showMessage("Failed to get fitbit friends");
                    callback(false, friends);
                }
                else {
                    that.fitbitFriends = friends;
                    if (friends) {
                        customCode.saveFriendsToStackmob(username, friends, function(success, data) {
                            if (!success) {
                                that.showMessage('Failed to save friends');
                                if (typeof data === "string") {
                                    console.log(data);
                                }
                                callback(false, data);
                            }
                            else {
                                that.friendIDs = data.get('friends');
                                callback(true, data);
                                //that.showMessage(data.get('friendcount') + ' of your ' + data.get('fitbitfriendcount') + ' friends are using fitness challenge');
                            }
                        });
                    }
                }
            });
        },

        getStackmobFriends: function(friendIDs, callback) {
            var that = this;
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            var User = StackMob.Model.extend({ schemaName: 'user' });
            var Users = StackMob.Collection.extend({ model: User });
            var users = new Users();

            var friendsQuery = new StackMob.Collection.Query();
            friendsQuery.mustBeOneOf('username', friendIDs);
            users.query(friendsQuery, {
                success: function(friends) {
                    that.friends = friends;
                    callback(true, friends);
                },
                error: function(friends, response) {
                    console.debug('failed to get fitness challenge friends');
                    callback(false, response);
                }
            });
        },

        getChallengeInvites : function(username, callback) {
            var that = this;
            that.log('in fitness.getChallengeInvites');
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
            var Invitations = StackMob.Collection.extend({ model: Invitation });
            //var invitations = new InvitesCollection();
            var invitations = new Invitations();
            var q = new StackMob.Collection.Query();
            q.equals('inviteduser', username);
            q.equals('responded', false);
            q.setExpand(2); // invite -> challenge (used to be 3 to get leaders, need to query to get the count now)
            that.log('querying invites');
            invitations.query(q, {
                success: function(model) {

                    that.log('query succeeded');
                    that.invitations = model;
                    that.invitationLookup = {};
                    var numInvites = model.models.length;
                    var loopCount = 0;
                    if (model.models.length == 0) {
                        that.log('models length 0, no invitations?');
                        callback(true);
                        return;
                    }
                    that.log(model.models.length + ' invitations fetched');
                    _.each(model.models, function(invitation) {
                        var challenge = invitation.get('challenge');
                        if (!challenge) {
                            that.showMessage('missing challenge for invitation');
                        }
                        var q = new StackMob.Collection.Query();
                        q.equals('challenge', challenge.challenge_id);
                        var Leader = StackMob.Model.extend({ schemaName: 'leader' });
                        var Leaders = StackMob.Collection.extend({ model: Leader });
                        var leaders = new Leaders();

                        leaders.count(q, {
                            success: function(count) {
                                loopCount++;
                                invitation.set('leader_count', count);
                                that.invitationLookup[invitation.get('invitation_id')] = invitation;
                                console.debug('invitation ID: ' + invitation.get('invitation_id') + ' has leader count: ' + count);
                                if (loopCount === numInvites) { // todo: make the invitations a backbone collection that listens for changes, so this won't be necessary
                                    callback(true, model);
                                }

                            },
                            error: function(count, response) {
                                console.debug('failed to get leader count for invitation ID: ' + invitation.get('invitation_id'));
                                invitation.set('leader_count', 0);
                                console.debug(response);
                                callback(false, response);
                            }
                        });

                    });
                },
                error: function(model, response) {
                    that.showMessage('Failed to check for challenge invites');
                    console.debug(response);
                    callback(false, response);
                }
            });
        },

        getChallenge : function(challengeID, callback) {
            var that = this;
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
            if (!challengeID) {
                callback(false);
                return;
            }

            var Challenge = StackMob.Model.extend({ schemaName: 'challenge'});
            var challenge = new Challenge({'challenge_id' : challengeID});
            challenge.fetchExpanded(2, {
                success: function(model) {
                    console.debug(JSON.stringify(model.toJSON()));
                    that.challengeLookup[model.get('challenge_id')] = model;
                    callback(true, model);
                },
                error: function(model, response) {
                    console.debug(response);
                    callback(false, response);
                }
            });
        },


        getUserChallenges : function(username, allowCaching, callback) {
            var that = this;
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
//            if (allowCaching && this.challenges) {
//                callback(true, this.challenges);
//                return;
//            }
            if (!username) {
                callback(false);
                return;
            }
            var Leader = StackMob.Model.extend({ schemaName: 'leader' });
            var Leaders = StackMob.Collection.extend({ model: Leader });
            var leaders = new Leaders();


            var Challenge = StackMob.Model.extend({ schemaName: 'challenge' });
            var Challenges = StackMob.Collection.extend({ model: Challenge });

            var leadersQuery = new StackMob.Collection.Query();
            leadersQuery.equals('user', username);
            leadersQuery.setExpand(1);
            leaders.query(leadersQuery, {
                success: function(leaders) {
                    //that.leaders = leaders;
                    //var challenges = new Challenges();

                    function compare(b, a) {
                        if (a.enddate < b.enddate)
                            return -1;
                        if (a.enddate > b.enddate)
                            return 1;
                        return 0;
                    }
                    var challenge_list = [];
                    leaders.each(function(leader) {
                        var challenge = leader.get('challenge');
                        challenge_list.push(challenge);
                    });
                    challenge_list = challenge_list.sort(compare);
                    that.challenges = new Challenges();
                    that.challenges.reset(challenge_list);
                    callback(true, that.challenges);

                    that.challenges.each(function(challenge) {
                        var q = new StackMob.Collection.Query();
                        q.equals('challenge', challenge.get('challenge_id'));
                        leaders.count(q, {
                            success: function(count) {
                                challenge.set('leader_count', count);
//                                console.debug(count);
                            },
                            error: function(count, response) {
                                challenge.set('leader_count', 0);
                                console.debug(response);
                            }
                        });
                    });
                },
                error: function(leaders, response) {
                    console.debug('failed to get fitness leaders');
                    callback(false, response);
                }
            });

//            var sm_user = new StackMob.User({ username: username });
//            sm_user.fetchExpanded(1, {
//                success: function(model) {
//                    var tempUser = model;
//                    that.challenges = tempUser.get('challenges');
//                    if (typeof that.challenges !== "object") {
//                        that.showMessage('Could not retrieve your challenges');
//                        callback(false, model);
//                        return;
//                    }
//                    callback(true, model);
//                },
//                error: function(data, response) {
//                    that.showMessage('Could not retrieve your user data');
//                    callback(false, response);
//                }
//            });
        },

        decorateChallengeWithLeaders: function (challenge, callback) {

            var Leader = StackMob.Model.extend({ schemaName: 'leader' });
            var Leaders = StackMob.Collection.extend({ model: Leader });
            var leaders = new Leaders();

            var leadersQuery = new StackMob.Collection.Query();
            leadersQuery.equals('challenge', challenge.get('challenge_id'));
            leadersQuery.orderAsc('int_value');
            leadersQuery.setExpand(1); // to get the users
            leaders.query(leadersQuery, {
                success: function(leaderModels) {
                    var leaders = [];
                    _.each(leaderModels.models, function(leader) { // convert from stackmob models to simple objects
                        leaders.push(leader.attributes);
                    });
                    challenge.set('leaders', leaders);
                    callback(true, challenge);
                },
                error: function(leaders, response) {
                    console.debug('failed to get fitness leaders');
                    callback(false, response);
                }
            });
        },

        updateIfStale : function(username, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
//            var lastUpdate = sessionStorage.getItem('fitbitUpdated');
//            if (lastUpdate) {
//                callback(true, 'Already updated fitbit info');
//                return;
//            }
//            if (this.friends) {
//                callback(true);
//                return;
//            }
            var that = this;
            var updatedFully = true;
            that.challengeLookup = that.challengeLookup || {};
            that.getChallengeInvites(username, function() {});
            customCode.subscribeToFitbit(username, null);
            if (!that.challenges) {
                $.mobile.showPageLoadingMsg();
                that.getUserChallenges(username, false, function(success) {
                    $.mobile.hidePageLoadingMsg();
                    if (!success) {
                        fitness.showMessage('Failed to get challenges');
                        return;
                    }
                    callback(updatedFully, {});
                });
            }
            else {
                callback(updatedFully, {});
            }

//                    if (data.models.length > 0) {
//                        for (var i = 0; i < data.models.length; i++) {
//                            var model = data.models[i];
//                            that.showMessage('you have a challenge invitation from ' + model.get('challengeinviter') + '!');
//                        }
//                    }
//                    else {
//                        //that.showMessage('You have no pending challenge invitations');
//                    }
//                customCode.getFitbitFriends(username, function(success, friends) {
//                    if (!success) {
//                        that.showMessage("Failed to get fitbit friends");
//                        updatedFully = false;
//                    }
//                    else {
//                        that.friends = friends;
//                        if (friends) {
//                            customCode.saveFriendsToStackmob(username, friends, function(success, data) {
//                                if (!success) {
//                                    that.showMessage('Failed to save friends');
//                                    if (typeof data === "string") {
//                                        console.log(data);
//                                    }
//                                }
//                                else {
//                                    //that.showMessage(data.get('friendcount') + ' of your ' + data.get('fitbitfriendcount') + ' friends are using fitness challenge');
//                                }
//                            });
//                        }
//                    }
//                    customCode.updateActivities(username, function(success, data) {
//                        if (!success) {
//                            that.showMessage('Failed to get fitbit activities');
//                            updatedFully = false;
//                        }
//                        else {
//                            //that.showMessage("updated activities");
//                        }
//                        if (updatedFully) {
//                            sessionStorage.setItem('fitbitUpdated', 'true');
//                        }
//                        callback(updatedFully, data);
//                    });
//                });
//            });
        },

        joinUserToChallenge : function(stackmobUserID, challengeID, callback) {
            var that = this;
            if (typeof callback !== "function") {
                throw 'callback is required';
            }

            var Challenge = StackMob.Model.extend({ schemaName: 'challenge' });
            var challenge = new Challenge({'challenge_id' : challengeID});
            challenge.fetch({
                success: function(model) {

                    var Leader = StackMob.Model.extend({ schemaName: 'leader' });
                    var leaderID = challengeID + '_' + stackmobUserID;
                    var leaderData =  {
                            "leader_id" : leaderID,
                            "user" : stackmobUserID,
                            "challenge" : challengeID,
                            "is_final" : false
                        };
                    var challengeType = model.get('value_type');
                    switch (challengeType) {
                        case "int":
                        case null:
                            leaderData.value_int = 0;
                            break;
                        case "float":
                            leaderData.value_float = 0.0;
                            break;
                        case "boolean":
                            leaderData.value_boolen = false;
                    }
                    var leader = new Leader(leaderData);

                    leader.create({
                        success: function(model) {
                            var leaderID = model.get('leader_id');
                            console.debug('leader object is saved, leader_id: ' + leaderID);
                            callback(true, model);

//                            var leaders = challenge.get('leaders') || [];
//                            leaders.push(leaderID);
//                            challenge.save({"leaders" : leaders}, { // TODO: really just need to store a count
//                                // other option would be count the leaders for each challenge when fetching model
//                                success: function(model) {
//                                    that.challenges.add(model);
//                                    callback(true, model);
//                                },
//                                error: function(model, response) {
//                                    console.debug("Failed to update challenge with new leader entry");
//                                    leader.destroy();
//                                    console.debug(response);
//                                    callback(false, response);
//                                }
//                            });
                        },
                        error: function(model, response) {
                            console.debug(response);
                            console.debug("Failed to create leader entry");
                            callback(false, response);
                        }
                    });
                },
                error: function(model, response) {
                    console.debug(response);
                    console.debug("Failed to fetch challenge");
                    callback(false, response);
                }
            });
        },

        inviteFriendsToChallenge : function(challengeID, callback) {
            var that = this;
            var friendIDs = that.friends.models; //that.user.get('friends');
            if (friendIDs && friendIDs.length > 0) {
                var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
                var len = friendIDs.length;
                var successCount = 0;
                var errorCount = 0;
                for (var i = 0; i < len; i++) {
                    function makeCallbackIfDone() {
                        if (i === len -1) {
                            var success = len === successCount;
                            callback(success, successCount + ' invitations sent, ' + errorCount + ' failed.');
                        }
                    }
                    var friendID = friendIDs[i];
                    if (typeof friendID === "object") {
                        friendID = friendID.get('username');
                    }
                    var invitation = new Invitation({
                        "challenge" : challengeID,
                        "challengeinviter" : that.user.get('username'),
                        "inviteduser" : friendID,
                        "responded" : false,
                        "accepted" : false});
                    invitation.create({
                        success: function(model) {
                            successCount++;
                            console.debug('Invitation to ' + friendID + ' sent.');
                            makeCallbackIfDone();
                        },
                        error: function(model, response) {
                            errorCount++;
                            console.debug(response);
                            console.debug('Invitation to ' + friendID + ' failed.');
                            makeCallbackIfDone();
                        }
                    });
                }
            }
        },


//      router : new FitnessRouter(),

        init : function() {
            var that = this;
        }
    }

});

