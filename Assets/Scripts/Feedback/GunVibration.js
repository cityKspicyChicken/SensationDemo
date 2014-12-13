#pragma strict

class FeedbackStrength {
    public var actor = Actor ();
    public var strength : float = 1;
}

public var priority = 110;
public var feedback : FeedbackStrength[];

function OnStartFire () {
    for (instruction in feedback) {
        var vibration = Sensation.Vibration ();
        vibration.ActorIndex = instruction.actor.actorIndex;
        vibration.TargetRegion = instruction.actor.region;
        vibration.Intensity = instruction.strength;
        vibration.Priority = priority;

        Sensation.Client.Instance.SendAsync (vibration);
    }
}

function OnStopFire () {
    for (instruction in feedback) {
        var vibration = Sensation.Vibration ();
        vibration.ActorIndex = instruction.actor.actorIndex;
        vibration.TargetRegion = instruction.actor.region;
        vibration.Intensity = 0;
        vibration.Priority = priority;

        Sensation.Client.Instance.SendAsync (vibration);
    }
}
