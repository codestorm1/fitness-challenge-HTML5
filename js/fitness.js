//"use strict";

// Includes File Dependencies
//require([ "jquery", "backbone", "routers/FitnessRouter", "stackmob", "jquerymobile"], function( $, Backbone, FitnessRouter, StackMob ) {
//require([ "jquery", "backbone", "stackmob", "jquerymobile"], function( $, Backbone, StackMob ) {
define(["jquery"], function($) {
//    $(function() {
//        if (window.location.href.indexOf('stackmobapp.com') !== -1) {
//            StackMob.init({ // production
//                appName: "fitnesschallenge",
//                clientSubdomain: "twistedogregmailcom",
//                publicKey: "eb6421b3-9737-4f0b-97ce-8aebc448739b",
//                apiVersion: 2
//            });
//        }
//        else {
//            StackMob.init({ // dev
//                appName: "fitnesschallenge",
//                clientSubdomain: "twistedogregmailcom",
//                publicKey: "ba025b72-92db-4681-9abb-231baca5a94d",
//                apiVersion: 0
//            });
//        }
//        var username = localStorage.getItem('username');
//        if (username) {
//            fitness.loginWithID(username, function() {
//                fitness.init();
//                return;
//            });
//        }
//        else {
//            fitness.init();
//        }

//    });

//    require( [ "jquerymobile" ], function() {
//        // Instantiates a new Backbone.js Router
//        this.router = new FitnessRouter();
//    });


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
//            router : new FitnessRouter(),

            init : function() {
                var that = this;
            }
        }

});

