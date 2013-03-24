define("views/LoginView", [ "jquery", "backbone", "fitness", "customCodeClient"], function( $, Backbone, fitness, customCode) {

    var LoginView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        events: {"click #login_submit" : "loginSubmit"} ,

        render: function() {

            //var footerView = new FooterView( { el: "#login .footer" } );

            var header = $('#static_header_template');
            var template = $('#login_template');
            this.$el.empty();
            this.$el.append(header.html()).append(template.html());
            this.$el.trigger('create');
            var lastEmail = localStorage.getItem('lastEmail');
            if (lastEmail) {
                $("#email").val(lastEmail);
            }
            return this;
        },

        loginSubmit : function() {
            var email = $("#email").val();
            if (email) {
                localStorage.setItem('lastEmail', email);
            }
            var password = $('#password').val();
            $.mobile.loading("show");
            customCode.lookupFitnessUser(email, password, function(success, data) {
                if (success) { // logged in
                    fitness.user = data;
                    var username = fitness.user.get('username');
                    var user = new StackMob.User({ username: username, password: password });
                    user.login(false, {
                        success: function(model) {
//                            $.mobile.loading("hide");
                            fitness.user = data;
                            if (username) {
                                fitness.log("logged in as " + username + " (" + fitness.user.get('email') + ")");
                                localStorage.setItem('username', username);
                            }
//                            $.mobile.loading("show");
                            console.debug(model);
                            router.navigate('#home', true);
                        },
                        error: function(model, response) {
                            console.debug(response);
                            $.mobile.loading("hide");
                            fitness.showMessage('login failed\n ' + data);
                        }
                    });
                }
                else {
                    $.mobile.loading("hide");
                    fitness.showMessage('login failed\n ' + data);
                }
            });
        }
    });
    return LoginView;
});
