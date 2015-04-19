/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const tabs = require("sdk/tabs");
const fixtures = require("./fixtures");
const { cleanUI } = require("sdk/test/utils");

const { load } = require("../crx");

exports["test chrome.tabs.sendMessage"] = function(assert, done) {
  let title = "FOO";
  tabs.open({
    url: "data:text/html;charset=utf-8,<title>" + title + "</title>",
    onLoad: (tab) => {
      assert.equal(tab.title, "FOO", "title is FOO");

      tabs.on("load", function wait(tab) {
        if (tab.title == "DONE MESSAGE TEST") {
          assert.pass("the expected tab was created");
          tabs.removeListener("load", wait);
          unload();
          cleanUI().then(done);
        }
      })

      let { unload } = load({ rootURI: fixtures.url("addons/chrome.tabs.sendMessage/") });
    }
  });
}

require('sdk/test').run(exports);
