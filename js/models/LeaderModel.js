define("models/LeaderModel", [ "stackmob", "stackmobinit"], function(StackMob, stackmobinit ) {

    // The ChallengeModel constructor

    var LeaderModel = StackMob.Model.extend(
        { schemaName: 'leader'}
    );

    // Returns the ChallengeModel class
    return LeaderModel;

});
