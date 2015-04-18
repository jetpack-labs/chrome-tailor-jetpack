/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const tabs = require("sdk/tabs");
const background = require("../background");
const fixtures = require("./fixtures");
const { cleanUI } = require("sdk/test/utils");

exports["test chrome.tabs.create"] = function(assert, done) {
  var worker;
  var i = 1;
  tabs.on("load", function wait(tab) {
    assert.equal(tab.title, "Created Tab " + i++);
    if (i > 2) {
      worker.destroy();
      cleanUI().then(done);
    }
  });

  worker = background.create({
    scripts: fixtures.url("chrome.tabs.create.js"),
  });
}

require('sdk/test').run(exports);
