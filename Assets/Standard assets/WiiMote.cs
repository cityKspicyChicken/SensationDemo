using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class WiiMote : MonoBehaviour {
    [DllImport("UniWii")]
    private static extern void wiimote_start();
    [DllImport("UniWii")]
    private static extern void wiimote_stop();
    [DllImport ("UniWii")]
    private static extern bool wiimote_available(int which);
    [DllImport ("UniWii")]  
    private static extern bool wiimote_enableIR(int which);

    [DllImport ("UniWii")]
    private static extern float wiimote_getIrX(int which);
    [DllImport ("UniWii")]
    private static extern float wiimote_getIrY(int which);
     
    [DllImport ("UniWii")]
    private static extern byte wiimote_getNunchuckStickX(int which);
    [DllImport ("UniWii")]
    private static extern byte wiimote_getNunchuckStickY(int which);

    [DllImport ("UniWii")]
    private static extern bool wiimote_getButtonNunchuckZ(int which);
    [DllImport ("UniWii")]
    private static extern bool wiimote_getButtonHome(int which);
    [DllImport ("UniWii")]
    private static extern bool wiimote_getButtonB(int which);

    public static WiiMote instance { get; private set; }

    public float nunchuckDeadValue = 0.1f;

    public bool available { get; private set; }

    public bool homeDown { get; private set; }
    public bool homeUp { get; private set; }
    public bool homePressed { get; private set; }
    public bool bDown { get; private set; }
    public bool bUp { get; private set; }
    public bool bPressed { get; private set; }
    public bool nunchuckZDown { get; private set; }
    public bool nunchuckZUp { get; private set; }
    public bool nunchuckZPressed { get; private set; }

    private int wiiMoteIndex = 0;

    private bool invertIr = false;
    private float irX = 0;
    private float irY = 0;

    private float nunchuckX = 132;
    private float nunchuckY = 128;

    private float minNunchuckX = 40;
    private float minNunchuckY = 30;
    private float maxNunchuckX = 226;
    private float maxNunchuckY = 218;

    public Vector2 nunchuck {
        get {
            var result = new Vector2((nunchuckX - minNunchuckX) / (maxNunchuckX - minNunchuckX) - 0.5f, (nunchuckY - minNunchuckY) / (maxNunchuckY - minNunchuckY) - 0.5f);
            result *= 2;
            if (Mathf.Abs(result.x) < nunchuckDeadValue) {
                result.x = 0;
            }
            if (Mathf.Abs(result.y) < nunchuckDeadValue) {
                result.y = 0;
            }
            return result;
        }
    }

    public Vector2 ir {
        get {
            var result = new Vector2(irX, irY);
            if (invertIr) {
                result *= -1;
            }
            return result;
        }
    }


    void Awake () {
        available = false;
        nunchuckZPressed = false;
        nunchuckZDown = false;
        nunchuckZUp = false;

        // Only allow one instance at runtime.
        if (instance != null)
        {
            enabled = false;
            DestroyImmediate(this);
            return;
        }

        instance = this;
    }

	void Start () {
        wiimote_start();
    }

    void Update() {
        //Debug.Log("IR: " + minIrX + " - " + maxIrX + " - " + irX + " - " + ir);
        //Debug.Log("NC: " + minNunchuckY + " - " + maxNunchuckY + " - " + nunchuckY + " - " + nunchuck);

        bool nowAvailable = wiimote_available(wiiMoteIndex);
        if (nowAvailable && !available) {
            wiimote_enableIR(wiiMoteIndex);
        }

        available = nowAvailable;

        if (!available) {
            return;
        }

        UpdateButtons();

        var newIrX = wiimote_getIrX(wiiMoteIndex);
        var newIrY = wiimote_getIrY(wiiMoteIndex);
        irX = !float.IsNaN(newIrX) && !Mathf.Approximately(newIrX, -100) ? newIrX : irX;
        irY = !float.IsNaN(newIrY) && !Mathf.Approximately(newIrY, -100) ? newIrY : irY;

        if (bDown) {
            invertIr = !invertIr;
        }

        var newNunchuckX = wiimote_getNunchuckStickX(wiiMoteIndex);
        var newNunchuckY = wiimote_getNunchuckStickY(wiiMoteIndex);
        nunchuckX = newNunchuckX != 0 ? newNunchuckX : nunchuckX;
        nunchuckY = newNunchuckY != 0 ? newNunchuckY : nunchuckY;
        minNunchuckX = Mathf.Min(nunchuckX, minNunchuckX);
        minNunchuckY = Mathf.Min(nunchuckY, minNunchuckY);
        maxNunchuckX = Mathf.Max(nunchuckX, maxNunchuckX);
        maxNunchuckY = Mathf.Max(nunchuckY, maxNunchuckY);
    }

    void OnApplicationQuit() {
        wiimote_stop();
    }

    private void UpdateButtons() {
        nunchuckZDown = false;
        nunchuckZUp = false;
        bool newNunchuckZPressed = wiimote_getButtonNunchuckZ(wiiMoteIndex);
        if (newNunchuckZPressed && !nunchuckZPressed) {
            nunchuckZDown = true;
        } else if (!newNunchuckZPressed && nunchuckZPressed) {
            nunchuckZUp = true;
        }
        nunchuckZPressed = newNunchuckZPressed;

        homeDown = false;
        homeUp = false;
        bool newHomePressed = wiimote_getButtonHome(wiiMoteIndex);
        if (newHomePressed && !homePressed) {
            homeDown = true;
        } else if (!newHomePressed && homePressed) {
            homeUp = true;
        }
        homePressed = newHomePressed;

        bDown = false;
        bUp = false;
        bool newBPressed = wiimote_getButtonB(wiiMoteIndex);
        if (newBPressed && !bPressed) {
            bDown = true;
        } else if (!newBPressed && bPressed) {
            bUp = true;
        }
        bPressed = newBPressed;
    }
}
