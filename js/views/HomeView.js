define("views/HomeView", [ "jquery", "backbone", "mustache"], function( $, Backbone, Mustache) {


    this.HomeView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {

//            that.getChallengeInvites();
//            if (that.user.fitbituserid) {
//                that.getFitbitFriends(that.user.get('username'), function(success, friends) {
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
//                "username" : fitness.user.get('username'),
//                "displayName" : fitness.user.displayname,
//                "friendCount" : fitness.user.friendcount,
//                "fitbitFriendCount" : fitness.user.fitbitfriendcount
//            };
//            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(template.html());
            this.$el.trigger('create');

            return this;
        }
    });
    return HomeView;
});
