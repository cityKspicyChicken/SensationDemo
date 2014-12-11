#pragma strict

var origin : Transform;

private var hitInfo : RaycastHit;

var ray : Ray;

function Awake () {
}

function Update () {
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();

    ray = GetAimingRay();

    if (!Physics.Raycast(ray, hitInfo)) {
        var aimingPoint = ray.origin + ray.direction.normalized * 200;
        hitInfo.point = aimingPoint;
        hitInfo.distance = 200;
        hitInfo.normal = (ray.origin - aimingPoint).normalized;
    }
}

private function GetAimingRay () : Ray {
    var cameraHitInfo = RaycastHit ();
    var cameraRay = CameraManager.activeCamera.ScreenPointToRay(Input.mousePosition);
    if (Physics.Raycast(cameraRay, cameraHitInfo)) {
        return Ray(origin.position, cameraHitInfo.point - origin.position);
    } else {
        var aimingPoint = CameraManager.activeCamera.ScreenToWorldPoint(Vector3(Input.mousePosition.x, Input.mousePosition.y, 200));
        return Ray(origin.position, aimingPoint - origin.position);
    }
}

function GetHitInfo () : RaycastHit {
	return hitInfo;
}

function OnDrawGizmos () {
    if (hitInfo.transform) {
        Gizmos.DrawLine(origin.position, hitInfo.point);
    }   
}
