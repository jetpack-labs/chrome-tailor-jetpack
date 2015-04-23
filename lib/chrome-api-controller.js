/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { EventTarget } = require("sdk/event/target");
const { emit } = require("sdk/event/core");
const utils = require("./utils");

let FunctionMap = new Map();
let TargetHandlerMap = new Map();

exports.attach = function attach ({ target }) {
  let handler = handleChromeRequest.bind(null, target);
  TargetHandlerMap.set(target, handler);
  target.port.on("chrome-api:request", handler);
  target.port.on("chrome-api-test:notifyPass", (count) => emit(exports.events, "chrome-api-test:notifyPass", count));
  target.port.on("chrome-api-test:notifyFail", (msg) => emit(exports.events, "chrome-api-test:notifyFail", msg));
  target.port.on("chrome-api-test:log", (msg) => emit(exports.events, "chrome-api-test:notifyFail", msg));
};

exports.detach = function detach (target) {
  let handler = TargetHandlerMap.get(target);
  target.port.removeListener("chrome-api:request", handler);
};

/**
 * Adds a function to the Chrome API wrapper. Takes a name, which includes
 * the namespace as well as function name ("chrome.tabs.duplicate"), and a
 * function to be executed when called by the Chrome extension.
 *
 * @param {string} name
 * @param {function} fn
 */
exports.registerChromeFunction = function registerChromeFunction (name, fn) {
  FunctionMap.set(name, fn);
};

/**
 * Sends an event back to the Chrome content. Pass in the namespace with
 * event name, like "tabs.onCreated", and any additional arguments.
 *
 * @param {string} name
 * @param {Mixed} ...args
 */
exports.chromeEvent = function chromeEvent (name, ...args) {
  for (let [target] of TargetHandlerMap) {
    target.port.emit("chrome-api:event", { args, name });
  }
};

/**
 * Expose events for propagating things like test passes/failures from background scripts
 */
exports.events = new EventTarget();

/**
 * This probably can be changed but leaving for now.
 */
exports.bus = new EventTarget();

function handleChromeRequest (target, { name, args, id, success, failure }) {
  let fn = FunctionMap.get(name);
  let ns;

  // If not found, try fetching implementation for lazy loading.
  if (!fn) {
    try {
      ns = (name || "").split(".")[0];
      require(`./api/${ns}`);
      fn = FunctionMap.get(name);
    } catch (e) {
    }
  }

  // If still not found, API probably isn't implemented, send an alert
  // and respond to the request with empty data so it's not hanging.
  if (!fn) {
    utils.alertUnsupportedAPI(name);
    return;
  }

  // If the function has a success or failure callback, bind that so
  // we can respond back to the content script
  if (success != void 0) {
    args[success] = successCallback;
  }
  if (failure != void 0) {
    args[failure] = failureCallback;
  }

  // Call the implementation with the arguments received
  fn.apply(null, args);

  function successCallback () {
    target.port.emit("chrome-api:response", { id, res: Array.prototype.slice.call(arguments) });
  }

  function failureCallback () {
    target.port.emit("chrome-api:response", {
      id, res: Array.prototype.slice.call(arguments), error: true
    });
  }
}
