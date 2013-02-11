define([ "jquery", "backbone", "mustache", "../models/HomeModel" ], function( $, Backbone, Mustache, HomeModel ) {


    this.HomeView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {

//            var template = $('#create_challenge_template');
//            var header = $('#header_template');
//            var footer = $('#footer_template');
//            var dto = {};
//            var html = Mustache.to_html(template.html(), dto);
//            this.$el.empty();
//            this.$el.append(header.html()).append(html).append(footer.html());
//            this.$el.trigger('create');
//            return this;

//            if (window.location.href.indexOf('oauth_token') !== -1) {
//                that.completeFitbitAuth();
//                return;
//            }
//            if (!fitness.user.fitbituserid) {
//                window.location.href = '/#auth';
//            }
//
//            that.getChallengeInvites();
//            if (that.user.fitbituserid) {
//                that.getFitbitFriends(that.user.username, function(success, friends) {
//                    if (success) {
//                        that.saveFriendsToStackmob(friends);
//                        that.friends = friends;
//                    }
//                    else {
//                        that.showMessage("Failed to get fitbit friends");
//                    }
//                });
//                that.updateActivities();
//            }
//
            var template = $('#home_template');
//            var dto = {
//                "username" : fitness.user.username,
//                "displayName" : fitness.user.displayname,
//                "friendCount" : fitness.user.friendcount,
//                "fitbitFriendCount" : fitness.user.fitbitfriendcount
//            };
            var footer = $('#footer_template');
//            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(template.html()).append(footer.html());
            this.$el.trigger('create');

            return this;
        }
    });
    return HomeView;
});
