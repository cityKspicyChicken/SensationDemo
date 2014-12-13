#pragma strict

class Actor {
    public var region : Vibration.Region;
    public var actorIndex : int;

    private var intensity : float;

    function SetIntensity (value : float) {
        intensity = value;
    }

    function GetIntensity () : float {
        return intensity;
    }
}
