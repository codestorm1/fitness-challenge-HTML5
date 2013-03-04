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

        updateIfStale : function(username, callback) {
            if (typeof callback !== "function") {
                throw 'callback is required';
            }
//            var lastUpdate = sessionStorage.getItem('fitbitUpdated');
//            if (lastUpdate) {
//                callback(true, 'Already updated fitbit info');
//                return;
//            }
            if (this.friends) {
                callback(true);
                return;
            }
            var that = this;
            var updatedFully = true;
            customCode.getChallengeInvites(username, function(success, data) {
                if (!success) {
                    that.showMessage('Failed to check for challenge invites');
                    updatedFully = false;
                }
                if (data.models) {
                    if (data.models.length > 0) {
                        for (var i = 0; i < data.models.length; i++) {
                            var model = data.models[i];
                            that.showMessage('you have a challenge invitation from ' + model.get('challengeinviter') + '!');
                        }
                    }
                    else {
                        //that.showMessage('You have no pending challenge invitations');
                    }
                }

                customCode.getFitbitFriends(username, function(success, friends) {
                    if (!success) {
                        that.showMessage("Failed to get fitbit friends");
                        updatedFully = false;
                    }
                    else {
                        that.friends = friends;
                        if (friends) {
                            customCode.saveFriendsToStackmob(username, friends, function(success, data) {
                                if (!success) {
                                    that.showMessage('Failed to save friends');
                                    if (typeof data === "string") {
                                        console.log(data);
                                    }
                                }
                                else {
                                    //that.showMessage(data.get('friendcount') + ' of your ' + data.get('fitbitfriendcount') + ' friends are using fitness challenge');
                                }
                            });
                        }
                    }
                    customCode.updateActivities(username, function(success, data) {
                        if (!success) {
                            that.showMessage('Failed to get fitbit activities');
                            updatedFully = false;
                        }
                        else {
                            //that.showMessage("updated activities");
                        }
                        if (updatedFully) {
                            sessionStorage.setItem('fitbitUpdated', 'true');
                        }
                        callback(updatedFully, data);
                    });
                });
            });
        },



//            router : new FitnessRouter(),

        init : function() {
            var that = this;
        }
    }

});

