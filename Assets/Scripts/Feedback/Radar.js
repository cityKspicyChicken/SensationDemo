#pragma strict

class RadarIndicator {
    public var actor = Actor ();
    public var angle : int;

    private var previousIntensity : float = 0;

    function GetPreviousIntensity () : float {
        return previousIntensity;
    }

    function SetPreviousIntensity (value : float) {
        previousIntensity = value;
    }
}

public var intensityMapping : AnimationCurve;
public var intensityDistribution : AnimationCurve;
public var indicators : RadarIndicator[];

private var enemies = new List.<GameObject>();

function Start () {
    var objectsWithHealth = Resources.FindObjectsOfTypeAll(typeof(Health));
    for (var i = 0; i < objectsWithHealth.length; i++) {
        if (objectsWithHealth[i].gameObject.tag == "Enemy") {
            enemies.Add(objectsWithHealth[i].gameObject);
        }
    }

    Transmit();
}

function Transmit() {
    while (true) {
        for (indicator in indicators) {
            var newIntensity = indicator.actor.GetIntensity ();
            if (Mathf.Abs(newIntensity - indicator.GetPreviousIntensity ()) < 0.001) {
                continue;
            }
            var vibration = Sensation.Vibration ();
            vibration.ActorIndex = indicator.actor.actorIndex;
            vibration.TargetRegion = indicator.actor.region;
            vibration.Intensity = newIntensity;

            Sensation.Client.Instance.SendAsync (vibration);

            indicator.SetPreviousIntensity (newIntensity);
        }
        
        yield WaitForSeconds(10 / 1000.0f);
    }
}

function Update () {
    for (indicator in indicators) {
        indicator.actor.SetIntensity(0);
    }

    enemies = FilterNullReferences (enemies);

    for (enemy in enemies) {
        if (!enemy.activeInHierarchy) {
            continue;
        }

        var direction = enemy.transform.position - transform.position;
        direction = xz(direction);

        var intensity = intensityMapping.Evaluate(direction.magnitude);

        if (intensity < 0.001) {
            continue;
        }

        var angle = AngleTowards(xz(transform.forward), direction, Vector3.up);
        if (angle < 0) {
            angle += 360;
        }


        for (indicator in indicators) {
            var angleDiff = angle - indicator.angle;
            if (angleDiff > 180) {
                angleDiff -= 360;
            }
            var scaling = intensityDistribution.Evaluate(angleDiff);
            indicator.actor.SetIntensity(Mathf.Max(indicator.actor.GetIntensity(), intensity * scaling));
        }
    }
}


function xz (input : Vector3) : Vector3 {
    var flat = input;
    flat.y = 0;
    return flat;
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

function FilterNullReferences (objects : List.<GameObject>) {
    var result = new List.<GameObject>();
    for (var object in objects) {
        if (object) {
            result.Add(object);
        }
    }
    return result;
}
