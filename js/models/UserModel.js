// file dependencies
define([ "jquery", "underscore", "stackmob" ], function( $, _, StackMob ) {

    // The UserModel constructor

    StackMob.init({ // dev
        appName: "fitnesschallenge",
        clientSubdomain: "twistedogregmailcom",
        publicKey: "ba025b72-92db-4681-9abb-231baca5a94d",
        apiVersion: 0
    });


    var UserModel = StackMob.Model.extend( // TODO wrong way to extend a user object
        // new StackMob.User(regInfo);
        { schemaName: 'user'}
    );

    // Returns the ChallengeModel class
    return UserModel;

} );