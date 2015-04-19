/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const self = require("sdk/self");
const { PageMod } = require("sdk/page-mod");
const { convertPattern } = require("../lib/content-script-utils");
const { setup: setupChromeAPI, emitter, getTabID } = require("../lib/chrome-api-parent");
const { emit, on, off } = require('sdk/event/core');
const events = require("sdk/system/events");

/**
 * Translates a `content_script` entry in a manifest.json into
 * a PageMod.
 * https://developer.chrome.com/extensions/content_scripts
 *
 * @param {Array<string>} matches
 *        Specifies which pages should receive the injected content. Required.
 *        https://developer.chrome.com/extensions/match_patterns
 * @param {Array<string>} exclude_matches
 *        Excludes pages that this content would otherwise be injected into.
 *        https://developer.chrome.com/extensions/match_patterns
 * @param {boolean} match_about_blank
 *        Whether or not `about:*` pages should receive content, if matching the pattern matcher.
 * @param {Array<string>} css
 *        An array of paths to the CSS files that should be injected when matching.
 * @param {Array<string>} js
 *        An array of paths to the JS files that should be injected when matching.
 * @param {string} run_at
 *        Indicates when the content injected should be executed. Can be:
 *        "document_start", "document_end", "document_idle" (default).
 * @param {boolean} all_frames
 *        Whether or not content should be injected in all frames, or just the top. Defaults false.
 * @param {Array<string>} include_globs
 *        After matching `matches`, only inject in URLs that matches these globs.
 *        https://developer.chrome.com/extensions/content_scripts#match-patterns-globs
 * @param {Array<string>} exclude_globs
 *        Applied after matching `matches`, excludes URLs that matches these globs.
 *        https://developer.chrome.com/extensions/content_scripts#match-patterns-globs
 */
function create (options) {
  let { matches, exclude_matches, match_about_blank, css, js, run_at, all_frames, include_globs, exclude_globs } = options;

  // TODO support include_globs/exclude_globs?
  let include = convertPattern(matches);
  let exclude = exclude_matches ? convertPattern(exclude_matches) : void 0;

  // TODO should NOT inject the following APIs:
  //
  //  extension ( getURL , inIncognitoContext , lastError , onRequest , sendRequest )
  //  i18n
  //  runtime ( connect , getManifest , getURL , id , onConnect , onMessage , sendMessage )
  //  storage
  let scripts = [ self.data.url("chrome-api-child.js") ].concat([].concat(js || []));
  let styles = css ? [].concat(css) : void 0;

  let attachTo = all_frames ? ["existing", "frame"] : ["existing", "top"];

  let when = run_at === "document_start" ? "start" :
             run_at === "document_end" ? "ready" :
             "end";

  let manifest = require(options.rootURI + "manifest.json");

  let mod = PageMod({
    include: include,
    contentScriptFile: scripts,
    contentStyleFile: styles,
    contentScriptWhen: when,
    contentScriptOptions: {
      rootURI: options.rootURI,
      manifest: manifest
    },
    attachTo: attachTo,
    exclude: exclude,
    onAttach: worker => {
      setupChromeAPI({ target: worker });

      function tabsSendMessage(data) {
        var tabId = data.tabId;
        if (!worker.tab) {
          return null;
        }
        if (getTabID(worker.tab) == tabId) {
          worker.port.emit("tabs:send:message", data);
        }
      }
      on(emitter, "tabs:send:message", tabsSendMessage);
      worker.once("detach", () => {
        off(emitter, "tabs:send:message", tabsSendMessage);
      })
    }
  });

  function unloadWait(event) {
    if (event.subject.name == manifest.name) {
      mod.destroy();
      events.off("crx-unload", unloadWait, true);
    }
  }
  events.on("crx-unload", unloadWait, true);

  return mod;
}

module.exports = create;
