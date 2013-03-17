define("views/FooterView", [ "jquery", "backbone", "fitness"], function( $, Backbone, fitness) {

    var FooterView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },

        events: {"click .logout_link" : "logout"} ,

        render: function() {
            var footer = $('#footer_template');
            this.$el.empty();
            this.$el.append(footer.html());
            if (!fitness.isLoggedIn()) {
                this.$el.find('.logout_link').hide();
            }
            this.$el.trigger('create');
            return this;
        },

        logout: function () {
            fitness.logout();
            $.mobile.changePage( "#login" , { reverse: false, changeHash: true } );
        }

    });
    return FooterView;
});
