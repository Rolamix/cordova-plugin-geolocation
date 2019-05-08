/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

/**
 * Position error object
 *
 * @constructor
 * @param code  The error code to report, one of PERMISSION_DENIED, POSITION_UNAVAILABLE or TIMEOUT
 * @param message  A message describing the error, may or not may not be usable
 * @param internalErrorCode The internal error code reported by the native code, for more information
 */
var PositionError = function (code, message, internalErrorCode) {
  this.code = code || null;
  this.message = message || '';
  this.internalErrorCode = internalErrorCode || null;
};

PositionError.prototype.PERMISSION_DENIED = PositionError.PERMISSION_DENIED = 1;
PositionError.prototype.POSITION_UNAVAILABLE = PositionError.POSITION_UNAVAILABLE = 2;
PositionError.prototype.TIMEOUT = PositionError.TIMEOUT = 3;

module.exports = PositionError;
