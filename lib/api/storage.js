/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const ss = require("sdk/simple-storage");
const QUOTA_BYTES = 5242880; // 5 MB
const { registerChromeFunction } = require("../chrome-api-controller");

/**
 * All `storage.*` APIs (sync, local, managed) all have the same
 * functions defined as StorageArea.
 * https://developer.chrome.com/extensions/storage#type-StorageArea
 */

registerChromeFunction("storage.local.getBytesInUse", function (keys, callback) {
  if (typeof keys == "string") {
    keys = [ keys ];
  }

  // handle case where a blank list is provided
  if (Array.isArray(keys)) {
    if (keys.length == 0) {
      return callback(0);
    }
  }

  // TODO: if keys are provided, then only get the usage of those
  // handle case where total usage is desired
  callback(QUOTA_BYTES * ss.quotaUsage);
}, "Does not scope usage to keys, or handle case where total usage is desired.");

registerChromeFunction("storage.local.get", function (keys, callback) {
  let defaults = {};

  if (typeof keys == "object") {
    defaults = keys;
    keys = Object.keys(keys);
  }
  else if (typeof keys == "string") {
    keys = [ keys ];
  }

  let items = {};
  keys.forEach((key) => {
    items[key] = ss.storage[key] || defaults[key];
  });

  callback(items);
});

registerChromeFunction("storage.local.set", function (items, callback) {
  Object.keys(items).forEach((key) => {
    ss.storage[key] = items[key];
  });

  callback();
});
