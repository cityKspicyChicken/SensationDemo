#pragma strict

var origin : Transform;

private var hitInfo : RaycastHit;
private var tr : Transform;
var ray : Ray;

function Awake () {
	tr = transform;
}

function Update () {
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();

    var cameraHitInfo = RaycastHit ();
    var cameraRay = Camera.main.ScreenPointToRay(Input.mousePosition);
    if (Physics.Raycast(cameraRay, cameraHitInfo)) {
        var aimingRay = Ray(origin.position, cameraHitInfo.point - origin.position);
        Physics.Raycast(aimingRay, hitInfo);
        ray = aimingRay;
    } else {
        var aimingPoint = Camera.main.ScreenToWorldPoint(Vector3(Input.mousePosition.x, Input.mousePosition.y, 200));
        ray = Ray(origin.position, cameraRay.direction);
        hitInfo.point = aimingPoint;
        hitInfo.distance = Vector3.Distance(origin.position, aimingPoint);
        hitInfo.normal = (origin.position - aimingPoint).normalized;
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
