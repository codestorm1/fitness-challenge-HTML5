define("fitness", ["jquery", "stackmobinit", "customCodeClient"], function($, __SI, customCode) {
    //"use strict";
    return {
        parseDate : function(dateStr) {
            var parts = dateStr.match(/(\d+)/g);
            // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
            return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
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

        getInvitations : function(username, allowCaching, callback) {
            var that = this;
            if (allowCaching && this.invitations) {
                callback(true, this.invitations);
                return;
            }
            customCode.getChallengeInvites(username, function(success, data) {
                if (!success) {
                    that.showMessage('Failed to check for challenge invites');
                    callback(false, data);
                    return;
                }
                that.invitations = data;
                that.invitationLookup = {};
                _.each(data.models, function(invitation) {
                    that.invitationLookup[invitation.get('invitation_id')] = invitation;
                });
                callback(true, data);
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
                    that.challengeLookup = that.challengeLookup || {};
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
            if (allowCaching && this.challenges) {
                callback(true, this.challenges);
                return;
            }
            if (!username) {
                callback(false);
                return;
            }

            var sm_user = new StackMob.User({ username: username });
            sm_user.fetchExpanded(1, {
                success: function(model) {
                    var tempUser = model;
                    that.challenges = tempUser.get('challenges');
                    if (typeof that.challenges !== "object") {
                        that.showMessage('Could not retrieve your challenges');
                        callback(false, model);
                        return;
                    }
                    callback(true, model);
                },
                error: function(data, response) {
                    that.showMessage('Could not retrieve your user data');
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
//            var updatedFully = true;
            that.getInvitations(username, true, callback);
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
                            "challenge" : challengeID
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
                            var leaders = challenge.get('leaders') || [];
                            leaders.push(leaderID);
                            challenge.save({"leaders" : leaders}, {
                                success: function(model) {
                                    var challengeList = that.user.get('challenges');
                                    challengeList = challengeList || [];
                                    if ($.inArray(challengeID, challengeList) == -1) {
                                        challengeList.push(challengeID);
                                        that.user.save({'challenges' : challengeList}, {
                                            success: function(model) {
                                                callback(true, model);
                                            },
                                            error: function(model, response) {
                                                console.debug("Failed to update challenge");
                                                leader.delete();
                                                callback(false, response);
                                            }
                                        });
                                    }
                                },
                                error: function(model, response) {
                                    console.debug("Failed to update challenge with new leader entry");
                                    leader.delete();
                                    console.debug(response);
                                    callback(false, response);
                                }
                            });
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
                        if (i = len) {
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
                            makeCallbackIfDone();
                            console.debug('Invitation to ' + friendID + ' sent.');
                        },
                        error: function(model, response) {
                            errorCount++;
                            console.debug(response);
                            makeCallbackIfDone();
                            console.debug('Invitation to ' + friendID + ' failed.');
                        }
                    });
                }
            }
        },


//            router : new FitnessRouter(),

        init : function() {
            var that = this;
        }
    }

});

