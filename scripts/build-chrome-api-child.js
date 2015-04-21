/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

/**
 * Use the ./definitions/stubs.json manifest to create Chrome API stubs in
 * content process to communicate back to the add-ons main thread where the
 * implementation is handled.
 */

var path = require("path");
var fs = require("fs");
var stubs = require("../definitions/stubs.json");
var data = "";
var CONTENT_SCRIPT_DEST = path.join(__dirname, "..", "data", "chrome-api-child.js");
// List of scripts located in ./scripts/chrome-api-child/*.js,
// in order of injection, minus the header and footer.
var SCRIPT_FILES = [
  "chrome-api-bridge.js"
];

// Inject the header first before all.
data += fs.readFileSync(path.join(__dirname, "chrome-api-child", "header.js"), "utf8");

// Inject all files in SCRIPT_FILES in order
SCRIPT_FILES.forEach(function (file) {
  data += closureWrap(fs.readFileSync(path.join(__dirname, "chrome-api-child", file), "utf8"));
});

// Inject our stub data so that globals and functions can be created
data += "JETPACK.API_DEFINITIONS = " + JSON.stringify(stubs) + "\n";

// Inject the footer that binds all of the APIs to the unsafeWindow etc. and kicks
// everything off.
data += fs.readFileSync(path.join(__dirname, "chrome-api-child", "footer.js"), "utf8");

// Output to ./data/chrome-api-child.js
fs.writeFileSync(CONTENT_SCRIPT_DEST, data);


/**
 * Wraps string `code` in an IIFE.
 */
function closureWrap (code) {
  return "\n(function(){\n" + code + "\n})();\n";
}
