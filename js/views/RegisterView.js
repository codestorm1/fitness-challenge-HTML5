this.RegisterView = Backbone.View.extend({
    el: '#main',

    initialize: function() {
        this.render();
    },

    render: function() {
        var template = $('#register_template');
        this.$el.empty();
        this.$el.append(template.html());
        this.$el.trigger('create');
        $('.logout-link').hide();
        return this;
    }
});
