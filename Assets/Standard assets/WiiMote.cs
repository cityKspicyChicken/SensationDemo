﻿using UnityEngine;
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

    public static WiiMote instance { get; private set; }

    public float nunchuckDeadValue = 0.1f;

    private int wiiMoteIndex = 0;

    public bool available { get; private set; }

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

        var newIrX = wiimote_getIrX(wiiMoteIndex);
        var newIrY = wiimote_getIrY(wiiMoteIndex);
        irX = !float.IsNaN(newIrX) && !Mathf.Approximately(newIrX, -100) ? newIrX : irX;
        irY = !float.IsNaN(newIrY) && !Mathf.Approximately(newIrY, -100) ? newIrY : irY;

        // sometimes the IR axis is inverted - this seems to help... :-/
        invertIr = invertIr || float.IsNaN(newIrX) || float.IsNaN(newIrY);

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
}
