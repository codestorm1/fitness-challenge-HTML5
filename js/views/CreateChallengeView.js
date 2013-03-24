// file dependencies
define("views/CreateChallengeView", [ "jquery", "backbone", "mustache", "fitness", "models/ChallengeModel" ], function( $, Backbone, Mustache, fitness, ChallengeModel ) {


    var CreateChallengeView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },

        events: {"click #create_challenge_submit" : "createChallengeSubmit"} ,

        render: function() {
            var template = $('#create_challenge_template');
            var header = $('#header_template');
            var dto = {};
            var html = Mustache.to_html(template.html(), dto);
            this.$el.empty();
            this.$el.append(header.html()).append(template.html());
            this.$el.trigger('create');
            return this;


//            var template = $('#profile_template');
//            var dto = fitness.user.toJSON();
//            var html = Mustache.to_html(template.html(), dto);
//
//            var header = $('#header_template');
//            this.$el.empty();
//            this.$el.append(header.html()).append(html);
//            //this.$el.append(header.html());
//            this.$el.trigger('create');
//            return this;

        },


        createChallengeSubmit : function() {
            var friendsInvited = 0;
            var challengeType = $("#challenge_type").val();


            var startDateStr = $('#start_date').val();
            var endDateStr = $('#end_date').val();

            if (!startDateStr || !endDateStr) {
                fitness.showMessage('Please enter a start and end date')
            }

            var startDate = fitness.parseDate(startDateStr);
            var endDate = fitness.parseDate(endDateStr);

            var challengeID = fitness.user.get('username') + '_' + challengeType + '_' + startDateStr + '_' + endDateStr;

            var Challenge = StackMob.Model.extend({ schemaName: 'challenge'});
            var challenge = new Challenge( {
                "challenge_id" : challengeID,
                "challengetype" : challengeType,
                "startdate" : startDate.getTime(),
                "enddate" : endDate.getTime(),
                "challengecreator" : fitness.user.get('username'),
                "value_type" : "int"
//                "users" : [fitness.user.get('username')]
                });
            $.mobile.loading("show");
            challenge.create({
                success: function(model) {
                    $.mobile.loading("hide");
                    fitness.joinUserToChallenge(fitness.user.get('username'), challengeID, function(success, leaderModel) {
                        if (!success) {
                            fitness.showMessage('Failed to create challenge, please try again');
                            challenge.delete();
                            return;
                        }
                        fitness.showMessage('Challenge created!');
                        fitness.inviteFriendsToChallenge(challengeID, function(success, data) {
                            fitness.showMessage('Finished inviting friends: ' + data);
                        })
                    });
                },
                error: function(model, response) {
                    $.mobile.loading("hide");
                    console.debug("Save challenge failed: " + response['error']);
                    if (response.error.indexOf('Duplicate') !== -1) {
                        fitness.showMessage("You've already created that challenge");
                    }
                    if (typeof callback === "function") {
                        callback(false);
                    }
                }
            });
        }
    });

    // Returns the View class
    return CreateChallengeView;

});