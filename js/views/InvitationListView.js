define("views/InvitationListView", [ "jquery", "backbone", "mustache", "fitness", "customCodeClient"],
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


        var InvitationListView = Backbone.View.extend({

            initialize: function() {
                var that = this;
                this.render();
                this.model.on("add", function(model) {
                    that.render();
                });
                this.model.on("remove", function(model) {
                    //alert('remove invite method called');
                    that.render();
                });
            },

            render: function() {
                var header = $('#header_template');
                var template = $('#invitation_list_template');
//                var challenges = [
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps"}},
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps2"}},
//                    { "attributes" : {"challengecreator" : "someone", "challengetype" : "steps3"}}];
//                var dto = {"challenges" : challenges};

                var invitations = [];
                _.each(this.model.models, function(invitation) {
                    var challenge = invitation.get('challenge');
                    if (!challenge) {
                        fitness.showMessage('missing challenge for invitation');
                    }
                    //var description = challenge.get('challengetype');
                    var startDate = new Date(challenge.startdate);
                    var endDate = new Date(challenge.enddate);
                    var description = "Total steps from " + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString();
                    var challengeDTO = {
                        "invitation_id" : invitation.get('invitation_id'),
                        "description" : description,
                        "count" : invitation.get('leader_count')
                    };
                    invitations.push(challengeDTO);
                });
                var dto = {"invitations" : invitations};
                var html = Mustache.to_html(template.html(), dto);
                this.$el.empty();
                this.$el.append(header.html()).append(html);
                this.$el.page();
                this.$el.trigger('pagecreate');
                $('#invitation_list ul[role="listview"]').listview().listview('refresh');
                return this;
            }
        });
        return InvitationListView;
    });
