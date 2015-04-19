/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const self = require("sdk/self");
const { getURL, manifest } = require("./crx");

const SUPPORTED_ACTIONS = [
  "background",
  "browser_action",
  "content_scripts",
  "chrome_url_overrides"
];

function execute () {
  Object.keys(manifest)
  .filter(key => !!~SUPPORTED_ACTIONS.indexOf(key))
  .forEach(action => {
    require(`./manifest-actions/${action}`)(manifest[action]);
  });
}

module.exports = execute;
