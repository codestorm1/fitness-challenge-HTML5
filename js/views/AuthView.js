define("views/AuthView", ["jquery", "backbone", "fitness", "customCodeClient"], function( $, Backbone, fitness, customCode) {

    var AuthView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },

        events: {"click #authorize_link" : "authorize"} ,

        render: function() {
            var header = $('#header_template');
            var template = $('#auth_template');
//                var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(template.html());
            this.$el.trigger('create');
            return this;
        },

        authorize: function () {
            localStorage.removeItem('request_token');
            localStorage.removeItem('request_token_secret');
            $.mobile.loading("show");
            customCode.getFitbitRequestToken(fitness.user.get('username'), function(success, tokens) {
                    if (success) {
                        localStorage.setItem('request_token', tokens.oauth_token);
                        localStorage.setItem('request_token_secret', tokens.oauth_token_secret);
                        window.location.href = 'http://www.fitbit.com/oauth/authorize?oauth_token=' + tokens.oauth_token + "&display=touch";
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
