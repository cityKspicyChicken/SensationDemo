#pragma strict

// Objects to drag in
public var motor : MovementMotor;
public var character : Transform;
public var cursorPrefab : GameObject;
public var joystickPrefab : GameObject;

// Settings
public var cameraSmoothing : float = 0.01;
public var cameraPreview : float = 2.0f;

// Cursor settings
public var aimingRaycast : PerFrameRaycast;
public var cursorPlaneHeight : float = 0;
public var cursorFacingCamera : float = 0;
public var cursorSmallerWithDistance : float = 0;
public var cursorSmallerWhenClose : float = 1;

// Private memeber data
private var mainCamera : Camera;

private var cursorObject : Transform;
private var joystickLeft : Joystick;
private var joystickRight : Joystick;

private var mainCameraTransform : Transform;
private var cameraVelocity : Vector3 = Vector3.zero;
private var cameraOffset : Vector3 = Vector3.zero;
private var initOffsetToPlayer : Vector3;

private var wiiMote : WiiMote;

// Prepare a cursor point varibale. This is the mouse position on PC and controlled by the thumbstick on mobiles.
private var cursorScreenPosition : Vector3;

private var playerMovementPlane : Plane;

private var joystickRightGO : GameObject;

function Awake () {
    motor.movementDirection = Vector2.zero;
    motor.facingDirection = Vector2.zero;
    
    // Set main camera
    mainCamera = CameraManager.activeCamera;
    mainCameraTransform = CameraManager.cameraTransform;
    
    // Ensure we have character set
    // Default to using the transform this component is on
    if (!character)
        character = transform;
    
    initOffsetToPlayer = mainCameraTransform.position - character.position;

    // if (cursorPrefab) {
    //     cursorObject = (Instantiate (cursorPrefab) as GameObject).transform;
    // }
        
    // Save camera offset so we can use it in the first frame
    cameraOffset = mainCameraTransform.position - character.position;
    
    // Set the initial cursor position to the center of the screen
    cursorScreenPosition = Vector3 (0.5 * Screen.width, 0.5 * Screen.height, 0);
    
    // caching movement plane
    playerMovementPlane = new Plane (character.up, character.position + character.up * cursorPlaneHeight);
}

function Start () {
    wiiMote = WiiMote.instance;
}


function OnDisable () {
    if (joystickLeft) 
        joystickLeft.enabled = false;
    
    if (joystickRight)
        joystickRight.enabled = false;
}

function OnEnable () {
    if (joystickLeft) 
        joystickLeft.enabled = true;
    
    if (joystickRight)
        joystickRight.enabled = true;
}

function HorizontalInput () : float {
    if (wiiMote.available) {
        return wiiMote.nunchuck.x;
    }
    return Input.GetAxis("Horizontal");
}

function VerticalInput () : float {
    if (wiiMote.available) {
        return wiiMote.nunchuck.y;
    }
    return Input.GetAxis ("Vertical");
}

function Update () {
    // HANDLE CHARACTER MOVEMENT DIRECTION
    motor.movementDirection = VerticalInput() * character.forward;
    
    // Make sure the direction vector doesn't exceed a length of 1
    // so the character can't move faster diagonally than horizontally or vertically
    if (motor.movementDirection.sqrMagnitude > 1)
        motor.movementDirection.Normalize();


    // character.rotation *= Quaternion.AngleAxis(Input.GetAxis("Horizontal"), Vector3.up);
    
    
    // HANDLE CHARACTER FACING DIRECTION AND SCREEN FOCUS POINT
    
    // First update the camera position to take into account how much the character moved since last frame
    //mainCameraTransform.position = Vector3.Lerp (mainCameraTransform.position, character.position + cameraOffset, Time.deltaTime * 45.0f * deathSmoothoutMultiplier);
    
    // Set up the movement plane of the character, so screenpositions
    // can be converted into world positions on this plane
    //playerMovementPlane = new Plane (Vector3.up, character.position + character.up * cursorPlaneHeight);
    
    // optimization (instead of newing Plane):
    
    playerMovementPlane.normal = character.up;
    playerMovementPlane.distance = -character.position.y + cursorPlaneHeight;
    
    // used to adjust the camera based on cursor or joystick position
    
    var cameraAdjustmentVector : Vector3 = Vector3.zero;
    
    
    // On PC, the cursor point is the mouse position
    var cursorScreenPosition : Vector3 = Input.mousePosition;
                
    // Find out where the mouse ray intersects with the movement plane of the player
    var cursorWorldPosition : Vector3 = ScreenPointToWorldPointOnPlane (cursorScreenPosition, playerMovementPlane, mainCamera);

    
    var halfWidth : float = Screen.width / 2.0f;
    var halfHeight : float = Screen.height / 2.0f;
    var maxHalf : float = Mathf.Max (halfWidth, halfHeight);
    
    // Acquire the relative screen position         
    var posRel : Vector3 = cursorScreenPosition - Vector3 (halfWidth, halfHeight, cursorScreenPosition.z);      
    posRel.x /= maxHalf; 
    posRel.y /= maxHalf;
                
                            
    // The facing direction is the direction from the character to the cursor world position
    motor.facingDirection = Quaternion.AngleAxis(HorizontalInput() * 3, Vector3.up) * character.forward;
    
    // Draw the cursor nicely
    // HandleCursorAlignment(mainCamera.ScreenToWorldPoint(Vector3(Input.mousePosition.x, Input.mousePosition.y, 10)));
            
        
    // HANDLE CAMERA POSITION
        
    // Set the target position of the camera to point at the focus point
    // var cameraTargetPosition : Vector3 = character.position + initOffsetToPlayer + cameraAdjustmentVector * cameraPreview;
    
    // Apply some smoothing to the camera movement
    // mainCameraTransform.position = Vector3.SmoothDamp (mainCameraTransform.position, cameraTargetPosition, cameraVelocity, cameraSmoothing);
    
    // Save camera offset so we can use it in the next frame
    cameraOffset = mainCameraTransform.position - character.position;
}

public static function PlaneRayIntersection (plane : Plane, ray : Ray) : Vector3 {
    var dist : float;
    plane.Raycast (ray, dist);
    return ray.GetPoint (dist);
}

public static function ScreenPointToWorldPointOnPlane (screenPoint : Vector3, plane : Plane, camera : Camera) : Vector3 {
    // Set up a ray corresponding to the screen position
    var ray : Ray = camera.ScreenPointToRay (screenPoint);
    
    // Find out where the ray intersects with the plane
    return PlaneRayIntersection (plane, ray);
}

function HandleCursorAlignment (cursorWorldPosition : Vector3) {
    if (!cursorObject)
        return;
    
    // HANDLE CURSOR POSITION

    // Set the position of the cursor object
    cursorObject.position = aimingRaycast.hitInfo.point;
    
    // Hide mouse cursor when within screen area, since we're showing game cursor instead
    Screen.showCursor = (Input.mousePosition.x < 0 || Input.mousePosition.x > Screen.width || Input.mousePosition.y < 0 || Input.mousePosition.y > Screen.height);
    
    // HANDLE CURSOR ROTATION
    
    var cursorWorldRotation : Quaternion = cursorObject.rotation;
    if (motor.facingDirection != Vector3.zero)
        cursorWorldRotation = Quaternion.LookRotation (motor.facingDirection);
    
    // Calculate cursor billboard rotation
    var cursorScreenspaceDirection : Vector3 = Input.mousePosition - mainCamera.WorldToScreenPoint (transform.position + character.up * cursorPlaneHeight);
    cursorScreenspaceDirection.z = 0;
    var cursorBillboardRotation : Quaternion = mainCameraTransform.rotation * Quaternion.LookRotation (cursorScreenspaceDirection, -Vector3.forward);
    
    // Set cursor rotation
    cursorObject.rotation = Quaternion.Slerp (cursorWorldRotation, cursorBillboardRotation, cursorFacingCamera);
    
    
    // HANDLE CURSOR SCALING
    
    // The cursor is placed in the world so it gets smaller with perspective.
    // Scale it by the inverse of the distance to the camera plane to compensate for that.
    var compensatedScale : float = 0.1 * Vector3.Dot (cursorWorldPosition - mainCameraTransform.position, mainCameraTransform.forward);
    
    // Make the cursor smaller when close to character
    var cursorScaleMultiplier : float = Mathf.Lerp (0.7, 1.0, Mathf.InverseLerp (0.5, 4.0, motor.facingDirection.magnitude));
    
    // Set the scale of the cursor
    cursorObject.localScale = Vector3.one * Mathf.Lerp (compensatedScale, 1, cursorSmallerWithDistance) * cursorScaleMultiplier;
    
    // DEBUG - REMOVE LATER
    if (Input.GetKey(KeyCode.O)) cursorFacingCamera += Time.deltaTime * 0.5;
    if (Input.GetKey(KeyCode.P)) cursorFacingCamera -= Time.deltaTime * 0.5;
    cursorFacingCamera = Mathf.Clamp01(cursorFacingCamera);
    
    if (Input.GetKey(KeyCode.K)) cursorSmallerWithDistance += Time.deltaTime * 0.5;
    if (Input.GetKey(KeyCode.L)) cursorSmallerWithDistance -= Time.deltaTime * 0.5;
    cursorSmallerWithDistance = Mathf.Clamp01(cursorSmallerWithDistance);
}
