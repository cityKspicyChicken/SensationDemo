using UnityEngine;
using System.Collections;

public class GlowPlaneOrient : MonoBehaviour {
	
	private Transform cameraTransform;
	
	void Start () {
		cameraTransform = CameraManager.cameraTransform;
	}
	
	// Update is called once per frame
	void Update () 
	{
		transform.rotation = Quaternion.LookRotation(-cameraTransform.forward, cameraTransform.up);
		
		// fade out for ugly angles
		float dist = (cameraTransform.position-transform.position).sqrMagnitude;
		transform.GetChild(0).renderer.material.color = new Color(0F,0F,0F, dist*0.00000000F);
	}
}
