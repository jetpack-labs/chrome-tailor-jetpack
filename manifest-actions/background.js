/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const self = require("sdk/self");
const pageWorker = require("sdk/page-worker");

const setupChromeAPI = require("../lib/chrome-api-parent").setup;

function create(options) {
  let pageURL = options.page || self.data.url("default-background.html");
  let scripts = (options.scripts || []);
  let contentScripts = [ self.data.url("chrome-api-child.js") ].concat(scripts);

  var backgroundPage = pageWorker.Page({
    contentURL: pageURL,
    contentScriptWhen: "start",
    contentScriptFile: contentScripts,
    contentScriptOptions: {
      rootURI: options.rootURI,
      manifest: require(options.rootURI + "manifest.json")
    }
  });

  setupChromeAPI({ target: backgroundPage });

  return backgroundPage;
}
module.exports = create;
