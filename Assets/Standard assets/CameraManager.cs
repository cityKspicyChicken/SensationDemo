using UnityEngine;
using System.Collections;
using System.Reflection;

public class CameraManager : MonoBehaviour {
    public enum Display {
        None,
        Rift,
        Regular
    } 

    public static CameraManager instance { get; private set; }
    public static Transform cameraTransform { get; private set; }
    public static Camera activeCamera { get; private set; }

    public GameObject ovrCameraRig;
    public GameObject mainCamera;

    public Display forceDisplay = Display.None;


	private void Awake()
    {
        // Only allow one instance at runtime.
        if (instance != null)
        {
            enabled = false;
            DestroyImmediate(this);
            return;
        }

        instance = this;


        if (forceDisplay != Display.Regular && (OVRManager.display.isPresent || forceDisplay == Display.Rift)) {
            ovrCameraRig.SetActive(true);
            mainCamera.SetActive(false);

            var leftEyeAnchor = ovrCameraRig.transform.Find("LeftEyeAnchor").gameObject;
            var rightEyeAnchor = ovrCameraRig.transform.Find("RightEyeAnchor").gameObject;
            CopyScripts(mainCamera, leftEyeAnchor);
            CopyScripts(mainCamera, rightEyeAnchor);

            cameraTransform = ovrCameraRig.transform.Find("CenterEyeAnchor");
            activeCamera = leftEyeAnchor.GetComponent<Camera>();
        } else {
            ovrCameraRig.SetActive(false);
            mainCamera.SetActive(true);
            cameraTransform = mainCamera.transform;
            activeCamera = mainCamera.GetComponent<Camera>();
        }
    }

    private void CopyScripts(GameObject source, GameObject destination) {
        foreach (MonoBehaviour b in source.GetComponents<MonoBehaviour>()) {
            System.Type type = b.GetType();
            MonoBehaviour copy = destination.AddComponent(type) as MonoBehaviour;

            foreach (FieldInfo field in type.GetFields(BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic)) {
                field.SetValue(copy, field.GetValue(b));
            }

            copy.enabled = b.enabled;
        }

    }

    void OnDamage() {
        activeCamera.SendMessage("OnDamage");
    }
}

