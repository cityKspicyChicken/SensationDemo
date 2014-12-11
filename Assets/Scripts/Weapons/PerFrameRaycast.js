#pragma strict

@script RequireComponent (AimingDirection)

var ray : Ray;
var hitInfo : RaycastHit;

private var aimingDirection : AimingDirection;

function Awake () {
    aimingDirection = GetComponent.<AimingDirection>() as AimingDirection;
}

function Update () {
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();

    ray = aimingDirection.ray;

    if (!Physics.Raycast(ray, hitInfo)) {
        var aimingPoint = ray.origin + ray.direction.normalized * 200;
        hitInfo.point = aimingPoint;
        hitInfo.distance = 200;
        hitInfo.normal = (ray.origin - aimingPoint).normalized;
    }
}


function OnDrawGizmos () {
    if (hitInfo.transform) {
        Gizmos.DrawLine(ray.origin, hitInfo.point);
    }   
}
