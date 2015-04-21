/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const tabs = require("sdk/tabs");
const fixtures = require("./fixtures");
const { cleanUI } = require("sdk/test/utils");
const ss = require("sdk/simple-storage");

const { load } = require("../crx");

exports["test chrome.storage.set"] = function(assert, done) {
  let title = "chrome.storage.set";
  let url = "data:text/html;charset=utf-8,<title>" + title + "</title>";
  tabs.open({
    url: url,
    onLoad: (tab) => {
      assert.equal(tab.title, title, "title is " + title);

      tabs.on("load", function wait(tab) {
        if (tab.title != title + " DONE")
          return null;
        tabs.removeListener("load", wait);
        assert.equal(ss.storage.urls.length, 1, "there is one url");
        assert.equal(ss.storage.urls[0], url, "the only url is correct!");

        unload();

        cleanUI().then(done);
      });

      let { unload } = load({ rootURI: fixtures.url("addons/chrome.storage.set/") });
    }
  });
}

require('sdk/test').run(exports);
