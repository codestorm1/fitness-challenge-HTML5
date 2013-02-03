// Includes file dependencies
define([ "jquery", "backbone", "mustache", "../models/ChallengeModel" ], function( $, Backbone, Mustache, ChallengeModel ) {


    var ChallengeView = Backbone.View.extend({
        el: '#create_challenge',

        initialize: function() {
            this.render();
        },

        render: function() {
            var template = $('#create_challenge_template');
            var header = $('#header_template');
            var footer = $('#footer_template');
            var dto = {};
            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(html).append(footer.html());
            this.$el.trigger('create');
            return this;
        }
//        render: function() {
//
//            // Sets the view's template property
//            this.template = _.template( $( "script#categoryItems" ).html(), { "collection": this.collection } );
//
//            // Renders the view's template inside of the current listview element
//            this.$el.find("ul").html(this.template);
//
//            // Maintains chainability
//            return this;
//
//        }

    });

    // Returns the View class
    return ChallengeView;

});