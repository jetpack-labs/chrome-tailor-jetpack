/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const contentScripts = require("./manifest-actions/content_scripts");
const background = require("./manifest-actions/background");
const browserAction = require("./manifest-actions/browser_action");
const overrides = require("./manifest-actions/chrome_url_overrides");
const events = require("sdk/system/events");

function load(options) {
  const rootURI = options.rootURI;
  const manifest = require(rootURI + "manifest.json");
  var browserActionBtn;
  var backgroundPage;
  var contentScriptMod;

  function getURL(path) {
    return rootURI + path;
  }

  if (manifest.background) {
    let options = JSON.parse(JSON.stringify(manifest.background));
    options.scripts = (Array.isArray(options.scripts) ? options.scripts : []).map(script => getURL(script));
    if (options.page) {
      options.page = getURL(options.page);
    }
    options.rootURI = rootURI;

    backgroundPage = background(options);
  }

  if (manifest.browser_action) {
    let options = JSON.parse(JSON.stringify(manifest.browser_action));
    options.default_popup = getURL(options.default_popup);
    options.default_icon = getURL(options.default_icon);
    options.rootURI = rootURI;

    browserActionBtn = browserAction(options);
  }

  if (manifest.chrome_url_overrides) {
    let options = JSON.parse(JSON.stringify(manifest.chrome_url_overrides));
    if (options.newtab) {
      options.newtab = getURL(options.newtab);
    }
    options.rootURI = rootURI;

    overrides(options);
  }

  if (manifest.content_scripts) {
    manifest.content_scripts.forEach(def => {
      let options = JSON.parse(JSON.stringify(def));
      options.rootURI = rootURI;
      if (options.js) {
        options.js = options.js.map(getURL);
      }
      if (options.css) {
        options.css = options.css.map(getURL);
      }

      contentScriptMod = contentScripts(options)
    });
  }

  return {
    unload: function() {
      events.emit("crx-unload", {
        subject: {
          name: manifest.name
        }
      });

      // TODO: close all overriden pages
    }
  }
}
exports.load = load;
