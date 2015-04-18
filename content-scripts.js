/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const self = require("sdk/self");
const { PageMod } = require("sdk/page-mod");
const { getURL } = require("./crx");
const { convertPattern } = require("./lib/content-script-utils");
const setupChromeAPI = require("./lib/chrome-api-parent").setup;

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
function create ({ matches, exclude_matches, match_about_blank, css, js, run_at, all_frames, include_globs, exclude_globs }) {

  // TODO support include_globs/exclude_globs?
  let include = convertPattern(matches);
  let exclude = exclude_matches ? convertPattern(exclude_matches) : void 0;
  
  // TODO should NOT inject the following APIs:
  //
  //  extension ( getURL , inIncognitoContext , lastError , onRequest , sendRequest )
  //  i18n
  //  runtime ( connect , getManifest , getURL , id , onConnect , onMessage , sendMessage )
  //  storage
  let scripts = [ self.data.url("chrome-api-child.js") ].concat([].concat(js || []).map(getURL));
  let styles = css ? [].concat(css) : void 0;

  let attachTo = all_frames ? ["existing", "frame"] : ["existing", "top"];

  let when = run_at === "document_start" ? "start" :
             run_at === "document_end" ? "ready" :
             "end";

  let mod = PageMod({
    include: include,
    contentScriptFile: scripts,
    contentStyleFile: styles,
    contentScriptWhen: when,
    attachTo: attachTo,
    exclude: exclude,
    onAttach: worker => setupChromeAPI({ target: worker })
  });

  return mod;
}
exports.create = create;
