define("models/ChallengeModel", [ "stackmob", "stackmobinit"], function(StackMob, stackmobinit ) {

    // The ChallengeModel constructor

    var ChallengeModel = StackMob.Model.extend(
        { schemaName: 'challenge'}
    );

    // Returns the ChallengeModel class
    return ChallengeModel;

} );