/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

/**
 * Alerts when there's access to an unsupported API.
 * Just console.warn for now, can figure out what to do later.
 *
 * @param {string} name
 */
exports.alertUnsupportedAPI = function alertUnsupportedAPI (name) {
  console.warn(`${name} is not yet unsupported.`);
};
