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

            var dto = { "challengeID" : this.model.get('challenge_id'),
                "description" : "Total steps from " + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString(),
                "leaders" : this.model.get('leaders')
            };
//            var Leader = StackMob.Model.extend({ schemaName: 'leader' });
//            var Leaders = StackMob.Collection.extend({ model: Leader });
//            var leaders = new Leaders();
            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(html);
            $('#challenge[data-role="listview"]').listview().listview('refresh');
            //this.$el.trigger('create');
            return this;
        }
    });
    return ChallengeView;
});
