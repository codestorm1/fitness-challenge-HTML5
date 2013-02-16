define([ "jquery", "backbone", "mustache", "fitness" ], function( $, Backbone, Mustache, fitness ) {

    this.FriendsView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {
            var template = $('#friends_template');
            this.$el.empty();
            this.$el.append(template.html());
            this.$el.trigger('create');
            return this;
        }
    });
    return FriendsView;
});
