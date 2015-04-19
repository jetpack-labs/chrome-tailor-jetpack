/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const tabs = require("sdk/tabs");
const background = require("../manifest-actions/background");
const fixtures = require("./fixtures");
const { cleanUI } = require("sdk/test/utils");

exports["test chrome.tabs.remove"] = function(assert, done) {
  var worker;
  var title = "Tab Remove Test";
  var i = 1;

  tabs.open({
    url: "data:text/html;charset=utf-8,<title>" + title + "</title>",
    onLoad: () => {
      tabs.on("close", function wait(tab) {
        assert.equal(tab.title, title);
        if (i++ >= 2) {
          tabs.removeListener("close", wait);
          worker.destroy();
          cleanUI().then(done);
        }
      });

      worker = background({
        scripts: fixtures.url("chrome.tabs.remove.js"),
        rootURI: fixtures.url("addons/chrome.runtime.getManifest/")
      });
    }
  });
}

require('sdk/test').run(exports);
