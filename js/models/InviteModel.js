define("models/InviteModel", [ "jquery", "underscore", "stackmob", "stackmobInit"], function( $, _, StackMob, stackmobInit) {

    // The ChallengeModel constructor

    var InviteModel = StackMob.Model.extend(
        { schemaName: 'invitation'}
    );

    // Returns the ChallengeModel class
    return InviteModel;

} );