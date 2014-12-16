#pragma strict

var wiiMoteSensitivity : float = 45;

var origin : Transform;

var ray : Ray;
private var direction : Vector3;
private var wiiMote : WiiMote;

function Awake () {
    direction = origin.forward;
}

function Start () {
    wiiMote = WiiMote.instance;
}

function Update () {
    if (wiiMote.available) {
        ray = WiiDirectionRay();
    } else {
        ray = DirectPointingRay();
    }
}

private function DirectPointingRay () : Ray {
    var cameraHitInfo = RaycastHit ();
    var cameraRay = CameraManager.activeCamera.ScreenPointToRay(Input.mousePosition);
    if (Physics.Raycast(cameraRay, cameraHitInfo)) {
        return Ray(origin.position, cameraHitInfo.point - origin.position);
    } else {
        var aimingPoint = CameraManager.activeCamera.ScreenToWorldPoint(Vector3(Input.mousePosition.x, Input.mousePosition.y, 200));
        return Ray(origin.position, aimingPoint - origin.position);
    }
}

private function MouseMovementRay () : Ray {
    var sensitivity = 10;
    var newDirection = Quaternion.AngleAxis(Input.GetAxis("Mouse X") * sensitivity, Vector3.up) * Quaternion.AngleAxis(Input.GetAxis("Mouse Y") * -sensitivity, Vector3.right) * direction;
    if (Vector3.Angle(newDirection, Vector3.forward) < 60) {
        direction = newDirection;
    }

    return Ray(origin.position, origin.TransformDirection(direction));
}

private function WiiDirectionRay () : Ray {
    var newDirection = Quaternion.AngleAxis(wiiMote.ir.x * wiiMoteSensitivity, Vector3.up) * Quaternion.AngleAxis(wiiMote.ir.y * -wiiMoteSensitivity, Vector3.right) * Vector3.forward;

    return Ray(origin.position, origin.TransformDirection(newDirection));
}
