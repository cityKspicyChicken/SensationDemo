#pragma strict

public var intensity : float = 1f;
public var duration : float = 0.3f;

private var hub : Sensation.Hub;

function Awake () {
    hub = GameObject.FindWithTag("SensationHub").GetComponent(Sensation.Hub);

    // build patterns
    var frontBuilder = new Sensation.PatternBuilder("hit_front");
    AddTracks(frontBuilder, Sensation.Vibration.Region.Chest, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    AddTracks(frontBuilder, Sensation.Vibration.Region.RightLeg, [3, 7, 11, 15]);
    AddTracks(frontBuilder, Sensation.Vibration.Region.LeftLeg, [3, 7, 11, 15]);
    Sensation.Client.Instance.SendAsync(frontBuilder.Build());

    var backBuilder = new Sensation.PatternBuilder("hit_back");
    AddTracks(backBuilder, Sensation.Vibration.Region.Back, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    AddTracks(backBuilder, Sensation.Vibration.Region.RightLeg, [5, 9, 13, 17]);
    AddTracks(backBuilder, Sensation.Vibration.Region.LeftLeg, [5, 9, 13, 17]);
    Sensation.Client.Instance.SendAsync(backBuilder.Build());

    var leftBuilder = new Sensation.PatternBuilder("hit_left");
    AddTracks(leftBuilder, Sensation.Vibration.Region.LeftArm, [0, 1, 2, 3, 4, 5, 6]);
    AddTracks(leftBuilder, Sensation.Vibration.Region.Chest, [3, 7, 11]);
    AddTracks(leftBuilder, Sensation.Vibration.Region.Back, [0, 4, 8]);
    AddTracks(leftBuilder, Sensation.Vibration.Region.LeftLeg, [0, 2, 6, 10, 14]);
    Sensation.Client.Instance.SendAsync(leftBuilder.Build());

    var rightBuilder = new Sensation.PatternBuilder("hit_right");
    AddTracks(rightBuilder, Sensation.Vibration.Region.RightArm, [0, 1, 2, 3, 4, 5, 6]);
    AddTracks(rightBuilder, Sensation.Vibration.Region.Chest, [0, 4, 8]);
    AddTracks(rightBuilder, Sensation.Vibration.Region.Back, [3, 7, 11]);
    AddTracks(rightBuilder, Sensation.Vibration.Region.RightLeg, [0, 2, 6, 10, 14]);
    Sensation.Client.Instance.SendAsync(rightBuilder.Build());
}

function AddTracks (builder : Sensation.PatternBuilder, region : Sensation.Vibration.Region, actors : int[]) : Sensation.PatternBuilder {
    for (actor in actors) {
        builder.AddTrack(region, actor).
            AddKeyframe(0, intensity, Sensation.Connection.Flat).
            AddKeyframe(duration, intensity, Sensation.Connection.Flat).
            AddKeyframe(duration + 0.01f, 0, Sensation.Connection.Flat);
    }
    return builder;
}

function OnDamage (amount : float, fromDirection : Vector3) {
    if (!this.enabled)
        return;

    var forward = transform.forward;
    forward.y = 0;
    fromDirection.y = 0;

    var angle = AngleTowards(forward, fromDirection, Vector3.up);
    
    if (Mathf.Abs(angle) < 45) {
        hub.PlayPattern("hit_front", 120);
    } else if (Mathf.Abs(angle) > 135) {
        hub.PlayPattern("hit_back", 120);
    } else if (angle < 0) {
        hub.PlayPattern("hit_left", 120);
    } else {
        hub.PlayPattern("hit_right", 120);
    }
}

function AngleTowards (input : Vector3, target : Vector3, up : Vector3) : float {
    var perp = Vector3.Cross(input, target);
    var dir = Vector3.Dot(perp, up);
    
    var angle = Vector3.Angle(input, target);
    
    if (dir > 0f)
        return angle;
    else if (dir < 0f)
        return -angle;
    else
        return 0f;
}
