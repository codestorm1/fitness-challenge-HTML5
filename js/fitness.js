"use strict";

// Includes File Dependencies
define(["jquery"], function($) {

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

//            router : new FitnessRouter(),

            init : function() {
                var that = this;
            }
        }

});

