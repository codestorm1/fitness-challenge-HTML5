// file dependencies
define([ "jquery", "backbone", "mustache", "fitness", "../models/ChallengeModel" ], function( $, Backbone, Mustache, fitness, ChallengeModel ) {


    var ChallengeView = Backbone.View.extend({
        el: '#create',

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
        },


        createChallengeSubmit : function() {
            var challengeType = $("#challenge_type").val();

            var startDateStr = $('#start_date').val();
            var endDateStr = $('#end_date').val();

            var startDate = fitness.parseDate(startDateStr);
            var endDate = fitness.parseDate(endDateStr);

            var challengeID = fitness.user.username + '_' + challengeType + '_' + startDateStr + '_' + endDateStr;

            var Challenge = StackMob.Model.extend({ schemaName: 'challenge'});
            var challenge = new Challenge( {
                "challenge_id" : challengeID,
                "challengetype" : challengeType,
                "startdate" : startDate.getTime(),
                "enddate" : endDate.getTime(),
                "challengecreator" : fitness.user.username,
                "users" : [fitness.user.username]});
            $.mobile.loading("show");
            challenge.create({
                success: function(model) {
                    $.mobile.loading("hide");
                    if (fitness.user.friends) {
                        var friendIDs = fitness.user.friends;
                        var challenge_id = model.attributes.challenge_id;
                        var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
                        var len = friendIDs.length;
                        for (var i = 0; i < len; i++) {
                            var friendID = friendIDs[i];
                            var invitation = new Invitation({
                                "challenge" : challengeID,
                                "challengeinviter" : fitness.user.username,
                                "inviteduser" : friendID,
                                "responded" : false,
                                "accepted" : false});
                            invitation.create({
                                success: function(model) {
                                    fitness.showMessage("invitation to " + friendID + " saved");
                                },
                                error: function(model) {
                                    fitness.showMessage("invitation to " + friendID + " failed");
                                }
                            });
                        }
                    }
                },
                error: function(model, response) {1
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
    return ChallengeView;

});