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
             customCode.createStackmobUser(email, newPassword, function(success, data) {
                 if (success) {
                     fitness.user = data;
                     localStorage.setItem('username', fitness.user.username);
                     router.navigate("auth", true);

                     //window.location.href = '/#auth'; // could send to '#' and let the router decide to go to #auth

                 }
                 else {
                     fitness.showMessage('Failed to save user:\n' + data);
                 }
             });
         },

        render: function() {
            var template = $('#register_template');
            var header = $('#header_template');
            var footer = $('#footer_template');
            this.$el.empty();
            this.$el.append(header.html()).append(template.html()).append(footer.html());
            this.$el.trigger('create');
            $('#register .logout-link').hide();
            return this;
        }
    });
    return RegisterView;
});
