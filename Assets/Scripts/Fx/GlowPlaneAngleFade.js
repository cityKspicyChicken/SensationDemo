
#pragma strict

var cameraTransform : Transform;
var glowColor : Color = Color.grey;
private var dot : float = 0.5f;

function Start () {
	if (!cameraTransform)
		cameraTransform = CameraManager.cameraTransform;
}

function Update () {
	dot = 1.5f * Mathf.Clamp01 (Vector3.Dot (cameraTransform.forward, -transform.up) - 0.25f);
}

function OnWillRenderObject () {	
	renderer.sharedMaterial.SetColor ("_TintColor",  glowColor * dot);	
}
