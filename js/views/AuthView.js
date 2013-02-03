this.AuthView = Backbone.View.extend({
    el: '#main',

    initialize: function() {
        this.render();
    },

    render: function() {
        $('#authorize_link').live('click', function() {
            that.getFitbitRequestToken(fitness.user.username, function(success, data) {
                    if (success) {
                        window.location.href = 'http://www.fitbit.com/oauth/authorize?oauth_token=' + data.oauth_token;
                    }
                    else {
                        that.showMessage('Sorry, could not authorize with fitbit.\n  Failed to get fitbit request token');
                    }
                }
            );
        });
        var template = $('#auth_template');
//                var html = Mustache.to_html(template.html(), dto);
        this.$el.empty();
        this.$el.append(template.html());
        $('.logout-link').show();
        this.$el.trigger('create');
        return this;
    }
});
