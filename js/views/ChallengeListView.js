define("views/ChallengeListView", [ "jquery", "backbone", "mustache", "fitness", "customCodeClient"],
    function( $, Backbone, Mustache, fitness, customCode) {


        var ChallengeListView = Backbone.View.extend({

            initialize: function() {
                this.render();
            },

            render: function() {
                var header = $('#header_template');
                var template = $('#challenge_list_template');
//                var challenges = [
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps"}},
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps2"}},
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps3"}}];
//                var dto = {"challenges" : challenges};

                var challenges = [];
                _.each(this.model.models, function(challenge) {
                    //var description = challenge.get('challengetype');
                    var startDate = new Date(challenge.get('startdate'));
                    var endDate = new Date(challenge.get('enddate'));
                    var description = "Total steps from " + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString();
                    var count = challenge.get('users').length;
                    var challengeDTO = { "description" : description,
                                         "count" : count};
                    challenges.push(challengeDTO);
                });
                var dto = {"challenges" : challenges};
                var html = Mustache.to_html(template.html(), dto);
                this.$el.empty();
                this.$el.append(header.html()).append(html);
                //this.$el.trigger('create');
                $('#challenge_list[data-role="listview"]').listview();
                return this;
            }
        });
        return ChallengeListView;
    });
