/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { cleanUI } = require("sdk/test/utils");
const { on } = require("sdk/event/core");

const { load } = require("../crx");
const ENABLED_TESTS = require("./chromium-api-tests.json");
const API_TEST_ROOT = module.uri.substr(0, module.uri.lastIndexOf("/") + 1) + "chromium_tests/api_test";

Object.keys(ENABLED_TESTS).forEach(testGroup => {
  ENABLED_TESTS[testGroup].forEach(testName => {
    let fullTestName = `${testGroup}/${testName}`;
    let manifestURL = `${API_TEST_ROOT}/${fullTestName}/`;
    exports[`test: ${fullTestName}`] = testRunner(manifestURL, fullTestName);
  });
});

function testRunner (manifestURL, name) {
  return function (assert, done) {
    let { addon, unload } = load({ rootURI: manifestURL, test: true });
    on(addon, "chrome-api-test:log", (message) => console.log(`log: ${message}`));
    on(addon, "chrome-api-test:notifyPass", (count) => {
      assert.ok(`${name}: ${count} tests passed.`);
      cleanUI();
      done();
    });
    on(addon, "chrome-api-test:notifyFail", (msg) => {
      assert.fail(`${name}: ${msg}`);
      cleanUI();
      done();
    });
  };
}

require("sdk/test").run(exports);
