
#pragma strict

public var aimingDirection : AimingDirection;

function Update () {
	transform.localScale = Vector3.one * Random.Range(0.5,1.5);

    transform.rotation = Quaternion.FromToRotation(Vector3.forward, aimingDirection.ray.direction);
	transform.localEulerAngles.z = Random.Range(0,90.0);
}
