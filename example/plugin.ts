/**
 *
 * This is an example of how to use this plugin in an Ionic app. It would be nearly identical for
 * a plain Cordova app or Phonegap with the exception of the `Platform` service and the angular
 * decorator, neither of which are required just to use the app in a webview.
 *
 * You should be able to just drop this into your project and go, it will work both for
 * browser development and for native apps.
 *
 */

import { Injectable, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

export interface Coordinates {
  /**
   * a double representing the position's latitude in decimal degrees.
   */
  latitude: number;

  /**
   * A double representing the position's longitude in decimal degrees.
   */
  longitude: number;

  /**
   * A double representing the accuracy of the latitude and longitude properties,
   * expressed in meters.
   */
  accuracy: number;

  /**
   * A double representing the position's altitude in metres, relative to sea
   * level. This value can be null if the implementation cannot provide the data.
   */
  altitude: number;

  /**
   * A double representing the accuracy of the altitude expressed in meters.
   * This value can be null.
   */
  altitudeAccuracy: number;

  /**
   * A double representing the direction in which the device is traveling. This
   * value, specified in degrees, indicates how far off from heading true north
   * the device is. 0 degrees represents true north, and the direction is
   * determined clockwise (which means that east is 90 degrees and west is 270
   * degrees). If speed is 0, heading is NaN. If the device is unable to provide
   * heading information, this value is null.
   */
  heading: number;

  /**
   * A double representing the velocity of the device in meters per second.
   * This value can be null.
   */
  speed: number;
}

export interface Geoposition {
  /**
   * A Coordinates object defining the current location
   */
  coords: Coordinates;

  /**
   * A timestamp representing the time at which the location was retrieved.
   */
  timestamp: number;
}

export interface PositionError {
  /**
   * A code that indicates the error that occurred
   */
  code: number;

  /**
   * A message that can describe the error that occurred
   */
  message: string;
}

export interface GeolocationOptions {
  /**
   * Is a positive long value indicating the maximum age in milliseconds of a
   * possible cached position that is acceptable to return. If set to 0, it
   * means that the device cannot use a cached position and must attempt to
   * retrieve the real current position. If set to Infinity the device must
   * return a cached position regardless of its age. Default: 0.
   */
  maximumAge?: number;

  /**
   * Is a positive long value representing the maximum length of time
   * (in milliseconds) the device is allowed to take in order to return a
   * position. The default value is Infinity, meaning that getCurrentPosition()
   * won't return until the position is available.
   */
  timeout?: number;

  /**
   * Indicates the application would like to receive the best possible results.
   * If true and if the device is able to provide a more accurate position, it
   * will do so. Note that this can result in slower response times or increased
   * power consumption (with a GPS chip on a mobile device for example). On the
   * other hand, if false, the device can take the liberty to save resources by
   * responding more quickly and/or using less power. Default: false.
   * @type {boolean}
   */
  enableHighAccuracy?: boolean;
}

export enum GeolocationPermissionStatus {
  DENIED = 0,
  GRANTED = 1
}

@Injectable()
export class CordovaPluginGeolocation {

  private Geolocation: any;

  constructor(
    private platform: Platform,
    private zone: NgZone,
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.Geolocation = (<any>window).plugins.RmxGeolocation;
        if (!this.Geolocation) {
          console.log('CordovaPluginGeolocation: Could not read `RmxGeolocation` from `window.plugins`: ', (<any>window).plugins);
          throw new Error('CordovaPluginGeolocation: Could not read `RmxGeolocation` from `window.plugins`');
        }
      }
    });
  }

  /**
   * Returns whether or not geolocation permissions are provided for the app.
   * In the case of iOS, GeolocationPermissionStatus.GRANTED will be returned if the user has
   * not yet been prompted for permissions; it is your responsibility to then request geolocation,
   * which will prompt the user for permissions, and if they are denied you will receive an error.
   * Future requests to check permissions will return DENIED.
   * In the case of Android, permissions may be denied, but unlike iOS, you can ask again and the
   * user will be prompted again (until they tell the OS to block requests).
   * This promise will only reject if a platform error occurs; permission denied will be returned
   * in the normal promise callback.
   */
  public getPermissionStatus(): Promise<GeolocationPermissionStatus> {
    if (!this.platform.is('cordova')) {
      // This is kind of cheating, but it's just here for debugging purposes.
      // The native plugin provides a true evaluation without prompting for permissions.
      return new Promise<Geoposition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10, enableHighAccuracy: false });
        })
        .then((val) => GeolocationPermissionStatus.GRANTED)
        .catch((e) => GeolocationPermissionStatus.DENIED);
    }

    return new Promise((resolve, reject) => {
      const success = (data: GeolocationPermissionStatus) => this.zone.run(() => resolve(data));
      const error = (err: any) => this.zone.run(() => reject(err));
      this.Geolocation.getPermissionStatus(success, error);
    });
  }

  /**
   * Get the device's current position.
   *
   * @param {GeolocationOptions} options  The [geolocation options](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions).
   * @returns {Promise<Geoposition>} Returns a Promise that resolves with the
   * [position](https://developer.mozilla.org/en-US/docs/Web/API/Position) of the device, or rejects with an error.
   */
  public async getCurrentPosition(options?: GeolocationOptions): Promise<Geoposition> {
    let pluginImpl = this.Geolocation;
    if (!this.platform.is('cordova')) {
      pluginImpl = navigator.geolocation;
    }

    return new Promise((resolve, reject) => {
      const success = (data: Geoposition) => this.zone.run(() => resolve(data));
      const error = (err: any) => this.zone.run(() => reject(err));
      pluginImpl.getCurrentPosition(success, error, options);
    });
  }

  /**
   * Watch the current device's position.  Clear the watch by unsubscribing from
   * Observable changes.
   *
   * ```typescript
   * const subscription = this.geolocation.watchPosition()
   *                               .filter((p) => p.coords !== undefined) //Filter Out Errors
   *                               .subscribe(position => {
   *   console.log(position.coords.longitude + ' ' + position.coords.latitude);
   * });
   *
   * // To stop notifications
   * subscription.unsubscribe();
   * ```
   *
   * @param {GeolocationOptions} options  The [geolocation options](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions).
   * @returns {Observable<Geoposition>} Returns an Observable that notifies with the
   * [position](https://developer.mozilla.org/en-US/docs/Web/API/Position) of the device, or errors.
   */
  public watchPosition(options?: GeolocationOptions): Observable<Geoposition> {
    let pluginImpl = this.Geolocation;
    if (!this.platform.is('cordova')) {
      pluginImpl = navigator.geolocation;
    }

    return new Observable<Geoposition>((observer: any) => {
      const watchId = pluginImpl.watchPosition(
        observer.next.bind(observer),
        observer.next.bind(observer),
        options
      );
      return () => pluginImpl.clearWatch(watchId);
    });
  }

}
