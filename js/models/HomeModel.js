// Includes file dependencies
define([ "jquery", "underscore", "stackmob" ], function( $, _, StackMob ) {

    // The ChallengeModel constructor

    StackMob.init({ // dev
        appName: "fitnesschallenge",
        clientSubdomain: "twistedogregmailcom",
        publicKey: "ba025b72-92db-4681-9abb-231baca5a94d",
        apiVersion: 0
    });


    var HomeModel = StackMob.Model.extend(
        { schemaName: 'challenge'}
    );

    // Returns the ChallengeModel class
    return HomeModel;

} );