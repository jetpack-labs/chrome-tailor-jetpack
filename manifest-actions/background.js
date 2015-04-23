/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const self = require("sdk/self");
const pageWorker = require("sdk/page-worker");
const { on, emit } = require("sdk/event/core");
const systemEvents = require("sdk/system/events");
const { attach, events } = require("../lib/chrome-api-controller");

function create(options) {
  let pageURL = options.page || self.data.url("default-background.html");
  let scripts = (options.scripts || []);
  let contentScripts = [ self.data.url("chrome-api-child.js") ].concat(scripts);
  let manifest = require(options.rootURI + "manifest.json");

  var backgroundPage = pageWorker.Page({
    contentURL: pageURL,
    contentScriptWhen: "start",
    contentScriptFile: contentScripts,
    contentScriptOptions: {
      rootURI: options.rootURI,
      manifest: manifest
    }
  });

  attach({ target: backgroundPage });
  on(events, "chrome-api:notifyPass", (count) => emit(backgroundPage, "chrome-api:notifyPass", count));
  on(events, "chrome-api:notifyFail", (msg) => emit(backgroundPage, "chrome-api:notifyFail", fail));

  function unloadWait(event) {
    if (event.subject.name == manifest.name) {
      backgroundPage.destroy();
      systemEvents.off("crx-unload", unloadWait, true);
    }
  }
  systemEvents.on("crx-unload", unloadWait, true);

  return backgroundPage;
}
module.exports = create;
