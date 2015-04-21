/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

/**
 * Creates a list of Chrome API names to register in content scripts. Used in
 * a build step, creates `./definitions/stubs.json`.
 */

var fs = require("fs");
var path = require("path");
var ChromeAPIDefinitions = require("chrome-api-definitions");
var STUB_PATH = path.join(__dirname, "..", "definitions", "stubs.json");

var definitions = ChromeAPIDefinitions.getDefinitions({ filter: "stable" });

var output = definitions.reduce(function (output, def) {
  var namespace = output[def.namespace] = {};
  namespace.functions = (def.functions || []).map(createFunctionDefinition);
  namespace.events = (def.events || []).map(createEventDefinition);
  return output;
}, {});

output = JSON.stringify(output, null, 2);

fs.writeFileSync(STUB_PATH, output);

function createFunctionDefinition (fn) {
  var paramStub = { name: fn.name };
  var params = fn.parameters;

  if (!params) {
    return paramStub;
  }

  var count = 0;
  for (var i = 0; i < params.length; i++) {
    if (params[i].type !== "function") {
      continue;
    }
    if (params[i].name === "callback") {
      paramStub.successCallbackIndex = i;
    }
    if (params[i].name === "successCallback") {
      paramStub.successCallbackIndex = i;
    }
    // Only webstore.install uses this, but lets do it anyway
    if (params[i].name === "failureCallback") {
      paramStub.failureCallbackIndex = i;
    }
  }

  return paramStub;
}

function createEventDefinition (ev) {
  return ev.name;
}
