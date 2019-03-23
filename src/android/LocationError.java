package org.apache.cordova.geolocation;

import org.json.JSONException;
import org.json.JSONObject;

public enum LocationError {
    LOCATION_PERMISSION_DENIED (100, "Location permission request denied"),
    GOOGLE_SERVICES_ERROR_RESOLVABLE (101, "Google Play Services error user resolvable"),
    GOOGLE_SERVICES_ERROR (102, "Google Play Services error"),
    SERIALIZATION_ERROR (103, "Location result serialization error"),
    WATCH_ID_NOT_FOUND (104, "Watch id not found"),
    LOCATION_SETTINGS_ERROR_RESOLVABLE (105, "Current location settings can not satisfy this request"),
    LOCATION_SETTINGS_ERROR (106, "Location settings error"),
    LOCATION_NULL (107, "Could not retrieve location");

    private final int code;
    private final String message;

    private static final int PERMISSION_DENIED = 1;
    private static final int POSITIONUNAVAILABLE = 2;
    // private static final int POSITIONTIMEOUT = 3;

    LocationError(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public JSONObject toJSON() {
        JSONObject obj = new JSONObject();

        int codeToUse = POSITIONUNAVAILABLE;
        if (this.code == 100) {
            codeToUse = PERMISSION_DENIED;
        }

        try {
            obj.put("code", codeToUse);
            obj.put("message", this.message);
            obj.put("internalErrorCode", this.code);
        }
        catch(JSONException e) {
            return obj;
        }

        return obj;
    }
}