// Includes file dependencies
define([ "jquery", "backbone"], function( $, Backbone) {


    this.LoginView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {

            var header = $('#header_template');
            var footer = $('#footer_template');
            var template = $('#login_template');
            this.$el.empty();
            this.$el.append(header.html()).append(template.html()).append(footer.html());
            this.$el.trigger('create');
            $('#login .logout-link').hide();
            return this;
        }
    });
    return LoginView;
});
