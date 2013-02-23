// Includes file dependencies
define([ "jquery", "underscore", "stackmob", "stackmobInit" ], function( $, _, StackMob, stackmobInit ) {

    // The ChallengeModel constructor

    var HomeModel = StackMob.Model.extend(
        { schemaName: 'challenge'}
    );

    // Returns the ChallengeModel class
    return HomeModel;

} );