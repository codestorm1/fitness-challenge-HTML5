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
            var description = fitness.formatDateRangeDescription(startDate, endDate);

            var dto = { "challengeID" : this.model.get('challenge_id'),
                "description" : description,
                "leaders" : this.model.get('leaders')
            };
            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(html);
            this.$el.trigger('refresh');
            return this;
        }
    });
    return ChallengeView;
});
