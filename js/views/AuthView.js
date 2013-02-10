define([ "jquery", "backbone", "../fitness", "../customCodeClient"], function( $, Backbone, fitness, customCode) {

    var AuthView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },

        events: {"click #authorize_link" : "authorize"} ,

        render: function() {
            var header = $('#header_template');
            var footer = $('#footer_template');
            var template = $('#auth_template');
//                var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(template.html()).append(footer.html());
            this.$el.trigger('create');
            return this;
        },

        authorize: function () {
            customCode.getFitbitRequestToken(fitness.user.username, function(success, data) {
                    if (success) {
                        window.location.href = 'http://www.fitbit.com/oauth/authorize?oauth_token=' + data.oauth_token;
                    }
                    else {
                        fitness.showMessage('Sorry, could not authorize with fitbit.\n  Failed to get fitbit request token');
                    }
                }
            );
        }

    });
    return AuthView;
});
