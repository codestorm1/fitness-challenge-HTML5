// file dependencies
define([ "jquery", "underscore", "stackmob", "stackmobInit" ], function( $, _, StackMob, stackmobInit ) {


    // The UserModel constructor
    var UserModel = StackMob.Model.extend( // TODO wrong way to extend a user object
        // new StackMob.User(regInfo);
        { schemaName: 'user'}
    );

    // Returns the ChallengeModel class
    return UserModel;

} );