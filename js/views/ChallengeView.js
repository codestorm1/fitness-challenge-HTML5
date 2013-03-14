define("views/ChallengeView", [ "jquery", "backbone", "mustache", "fitness" ], function( $, Backbone, Mustache, fitness ) {

    var ChallengeView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        render: function() {
            var header = $('#header_template');
            var template = $('#challenge_template');

            var startDate = new Date(this.model.get('startdate'));
            var endDate = new Date(this.model.get('enddate'));

            var dto = { "challengeID" : this.model.get("challenge_id"),
                "description" : "Total steps from " + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString(),
                "users" : this.model.get('users')
            };

            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(html);
            $('#challenge[data-role="listview"]').listview();
            //this.$el.trigger('create');
            return this;
        }
    });
    return ChallengeView;
});
