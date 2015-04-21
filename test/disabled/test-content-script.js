/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const tabs = require("sdk/tabs");
const fixtures = require("./fixtures");
const { cleanUI } = require("sdk/test/utils");
const { setTimeout } = require("sdk/timers");
const { PageMod } = require("sdk/page-mod");

const { load } = require("../crx");

exports["test content script all"] = function(assert, done) {
  let title = "FOO";
  tabs.open({
    url: "data:text/html;charset=utf-8,<title>" + title + "</title>",
    onLoad: (tab) => {
      assert.equal(tab.title, "FOO", "title is FOO");
      let { unload } = load({ rootURI: fixtures.url("addons/simple-content-script/") });

      let mod = PageMod({
        include: [ "*", "data:*" ],
        contentScript: 'self.port.on("get:title", () => self.port.emit("title", document.title))',
        attachTo: ["existing", "top"],
        onAttach: worker => {
          assert.pass("attached worker!");
          worker.port.on("title", (title) => {
            assert.equal(tab.title, title, "title is TEST");
            assert.equal(title, "TEST", "title is TEST");
            mod.destroy();
            unload();
            cleanUI().then(done);
          });
          worker.port.emit("get:title");
        }
      });
    }
  });
}

require('sdk/test').run(exports);
