define("views/ChallengeListView", [ "jquery", "backbone", "mustache", "fitness", "customCodeClient"],
    function( $, Backbone, Mustache, fitness, customCode) {


        var ChallengeListView = Backbone.View.extend({

            initialize: function() {
                this.render();
            },

            render: function() {
                var header = $('#header_template');
                var template = $('#challenge_list_template');
                var challenges = [];
                _.each(this.model, function(challenge) {
                    //var description = challenge.get('challengetype');
                    var startDate = new Date(challenge.startdate);
                    var endDate = new Date(challenge.enddate);
                    var description = "Total steps from " + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString();
                    var count = challenge.leaders.length;
                    var challengeDTO = { "challengeID" : challenge.challenge_id,
                                         "description" : description,
                                         "count" : count};
                    challenges.push(challengeDTO);
                });
                var dto = {"challenges" : challenges};
                var html = Mustache.to_html(template.html(), dto);
                this.$el.empty();
                this.$el.append(header.html()).append(html);
                this.$el.trigger('refresh');

                //this.$el.trigger('create');
                //$('#challenge_list[data-role="listview"]').listview().listview('refresh');
                return this;
            }
        });
        return ChallengeListView;
    });
