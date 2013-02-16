define([ "jquery", "backbone", "mustache", "fitness" ], function( $, Backbone, Mustache, fitness ) {

    this.FriendsView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {
            var header = $('#header_template');
            var template = $('#friends_template');
            this.$el.empty();
            this.$el.append(header.html()).append(template.html());
            this.$el.trigger('create');
            return this;
        }
    });
    return FriendsView;
});
