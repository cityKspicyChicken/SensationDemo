#pragma strict

public var mouseDownSignals : SignalSender;
public var mouseUpSignals : SignalSender;

private var wiiMote : WiiMote;

private var state : boolean = false;

function Start () {
    wiiMote = WiiMote.instance;
}

private function Activated () {
    return Input.GetMouseButtonDown (0) || wiiMote.nunchuckZDown;
}

private function Deactivated () {
    return Input.GetMouseButtonUp (0) || wiiMote.nunchuckZUp;
}

function Update () {
	if (state == false && Activated ()) {
		mouseDownSignals.SendSignals (this);
		state = true;
	} else if (state == true && Deactivated() ) {
		mouseUpSignals.SendSignals (this);
		state = false;
	}
}
