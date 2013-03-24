define("views/InvitationView", [ "jquery", "backbone", "mustache", "fitness", "customCodeClient"],
    function( $, Backbone, Mustache, fitness, customCode) {

//        var q = [
//            {
//                "challenge": "10072_steps_date_range_2013-03-09_2013-03-09",
//                "challengeinviter": "10072",
//                "invitation_id": "12050d9daf834380bac0f0194c6eee11",
//                "accepted": false,
//                "lastmoddate": 1362854801650,
//                "createddate": 1362854801650,
//                "responded": false,
//                "inviteduser": "10069"
//            }
//        ];


        var InvitationView = Backbone.View.extend({

            initialize: function() {
                this.render();
            },

            events: {"click .invitation_accept" : "acceptInvitation",
                     "click .invitation_decline" : "declineInvitation"
            },

            render: function() {
                var header = $('#header_template');
                var template = $('#invitation_template');
//                var challenges = [
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps"}},
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps2"}},
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps3"}}];
//                var dto = {"challenges" : challenges};

                var challenge = this.model.get('challenge');
                //var description = challenge.get('challengetype');
                var startDate = new Date(challenge.startdate);
                var endDate = new Date(challenge.enddate);
                var description = "Total steps from " + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString();
                var count = challenge.leaders.length;
                var invitationDTO = {
                    "invitation_id" : this.model.get('invitation_id'),
                    "description" : description,
                    "count" : count
                };

                var html = Mustache.to_html(template.html(), invitationDTO);
                this.$el.empty();
                this.$el.append(header.html()).append(html);
                this.$el.trigger('create');
//                $('#invitation[data-role="listview"]').listview();e
                return this;
            },

            saveModelChangePage : function(changes) {
                var Invitation = StackMob.Model.extend({ schemaName: 'invitation' });
                var invitation = new Invitation({ invitation_id: this.model.get('invitation_id')});
                // can't save the model directly since it has been expanded to include referenced objects
                invitation.save(changes, {
                    success: function(model) {
                        console.debug(JSON.stringify(model.toJSON()));
                        //fitness.showMessage('updated invitation');
                        router.navigate('#invitation_list', true);
                        //$.mobile.changePage('#invitation_list', {'reverse' : true, 'changeHash' : true});
                    },
                    error: function(model, response) {
                        console.debug(response);
                        fitness.showMessage('failed to update invitation');
                    }
                });
            },

            acceptInvitation : function(e) {
                var that = this;
                e.preventDefault();
                var inviteChallenge = this.model.get('challenge');
                $.mobile.showPageLoadingMsg();
                fitness.joinUserToChallenge(fitness.user.get('username'), inviteChallenge.challenge_id, function(success) {
                    if (!success) {
                        $.mobile.hidePageLoadingMsg();
                        fitness.showMessage('Failed to accept challenge, please try again');
                        return;
                    }
                });
                var username = this.model.get('inviteduser').username;
                var changes = {'accepted': true, 'responded' : true};
                that.model.set(changes);
                that.saveModelChangePage(changes);
            },

            declineInvitation : function(e) {
                e.preventDefault();
                var changes = {'accepted': false, 'responded' : true};
                this.model.set(changes);
                this.saveModelChangePage(changes);
            }

        });
        return InvitationView;
    });
