define("views/ProfileView", [ "jquery", "backbone", "mustache", "fitness", "customCodeClient"], function( $, Backbone, Mustache, fitness, customCode) {

    var ProfileView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        events: {
            "click #deauthorize" : "deauthorizeFitbit",
            "click #delete_user" : "deleteAccount"
        },

        render: function() {
            var template = $('#profile_template');
            var dto = this.model.toJSON();
            var html = Mustache.to_html(template.html(), dto);

            var header = $('#header_template');
            this.$el.empty();
            this.$el.append(header.html()).append(html);
            //this.$el.append(header.html());
            this.$el.trigger('create');
            return this;
        },

        deauthorizeFitbit : function() {
            $.mobile.loading("show");
            customCode.updateUserWithParams(fitness.user, {accesstoken : null}, function(success, data) {
                $.mobile.loading("hide");
                if (success) {
                    router.navigate("auth", true);
                }
                else {
                    fitness.showMessage('Failed to update user:\n' + data);
                }
            });
        },

        deleteAccount : function() {
            $.mobile.loading("show");
            fitness.deleteUser(function(success, data, response) {
                $.mobile.loading("hide");
                if (success) {
                    fitness.showMessage('Account deleted');
                    router.navigate("login", true);
                }
                else {
                    var message = 'Failed to delete account ' + response || '';
                    fitness.showMessage(message);
                }
            });
        }

    });
    return ProfileView;
});

