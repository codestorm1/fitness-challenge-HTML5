define([ "jquery", "backbone", "mustache", "fitness" ], function( $, Backbone, Mustache, fitness ) {

    this.FriendsView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {
            var header = $('#header_template');
            var template = $('#friends_template');

            var dto;
            if (fitness.isLoggedIn() && fitness.user.get('friends')) {
                dto = fitness.user.toJSON().friends;
            }
            else {
                dto = {};
            }
            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(html);
            this.$el.trigger('create');
            return this;
        }
    });
    return FriendsView;
});
