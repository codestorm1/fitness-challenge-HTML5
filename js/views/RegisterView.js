define([ "jquery", "backbone", "../fitness", "../customCodeClient"], function( $, Backbone, fitness, customCode) {

     var RegisterView = Backbone.View.extend({

        initialize: function() {
            this.render();
        },

         events: {"click #register_submit" : "registerSubmit"} ,

         registerSubmit: function() {
             var email = $("#register_email").val();
             var newPassword = $('#new_password').val();
             var confirmPassword = $('#confirm_password').val();
             if (newPassword !== confirmPassword) {
                 fitness.showMessage("Passwords do not match");
                 return;
             }
             $.mobile.loading("show");
             customCode.createStackmobUser(email, newPassword, function(success, data) {
                 if (success) {
                     $.mobile.loading("hide");
                     fitness.user = data;
                     if (fitness.user.get('username')) {
                         localStorage.setItem('username', fitness.user.get('username'));
                     }
                     router.navigate("auth", true);

                     //window.location.href = '/#auth'; // could send to '#' and let the router decide to go to #auth

                 }
                 else {
                     $.mobile.loading("hide");
                     fitness.showMessage('Failed to save user:\n' + data);
                 }
             });
         },

        render: function() {
            var template = $('#register_template');
            var header = $('#header_template');
            this.$el.empty();
            this.$el.append(header.html()).append(template.html());
            this.$el.trigger('create');
            return this;
        }
    });
    return RegisterView;
});
