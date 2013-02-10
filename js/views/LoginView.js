define([ "jquery", "backbone", "../fitness", "../customCodeClient"], function( $, Backbone, fitness, customCode) {

    var LoginView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

        events: {"click #login_submit" : "loginSubmit"} ,

        render: function() {

            var header = $('#header_template');
            var footer = $('#footer_template');
            var template = $('#login_template');
            this.$el.empty();
            this.$el.append(header.html()).append(template.html()).append(footer.html());
            this.$el.trigger('create');
            $('#login .logout-link').hide();
            return this;
        },

        loginSubmit : function() {
            var email = $("#email").val();
            var password = $('#password').val();
            customCode.lookupFitnessUser(email, password, function(success, data) {
                if (success) { // logged in
                    fitness.user = data;
                    localStorage.setItem('username', that.user.username);
                    router.navigate('home');
//                    window.location.href = '/#home';
                }
                else {
                    fitness.showMessage('login failed\n ' + data);
                }
            });
        }
    });
    return LoginView;
});
