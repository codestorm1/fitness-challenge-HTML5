define("views/ChallengeListView", [ "jquery", "backbone", "mustache", "moment", "fitness", "customCodeClient"],
    function( $, Backbone, Mustache, moment, fitness, customCode) {


        var ChallengeListView = Backbone.View.extend({

            initialize: function() {
                var that = this;
                this.render();
                this.model.on("add", function(model) {
                    //alert('add method called')
                    that.render();
                });
                this.model.on("remove", function(model) {
                    that.render();
                });
            },

            render: function() {
                var header = $('#header_template');
                var template = $('#challenge_list_template');
                var challenges = [];
                _.each(this.model.models, function(challenge) {
                    //var description = challenge.get('challengetype');
                    var startDate = new Date(challenge.get('startdate'));
                    var endDate = new Date(challenge.get('enddate'));

                    var description = fitness.formatDateRangeDescription(startDate, endDate);
                    var count = challenge.get('leaders').length;
                    var challengeDTO = { "challengeID" : challenge.get('challenge_id'),
                                         "description" : description,
                                         "count" : count};
                    challenges.push(challengeDTO);
                });
                var dto = {"challenges" : challenges};
                var html = Mustache.to_html(template.html(), dto);
                this.$el.empty();
                this.$el.append(header.html()).append(html);
                this.$el.page();
                this.$el.trigger('pagecreate');
                $('#the_list').listview().listview('refresh');
                return this;
            }
        });
        return ChallengeListView;
    });
