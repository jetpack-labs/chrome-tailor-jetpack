/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { EventTarget } = require("sdk/event/target");
const utils = require("./utils");

let FunctionMap = new Map();
let TargetHandlerMap = new WeakMap();

exports.attach = function attach ({ target }) {
  let handler = handleChromeRequest.bind(null, target);
  TargetHandlerMap.set(target, handler);
  console.log("attached Chrome API controller");
  target.port.on("chrome-api:request", handler);
};

exports.detach = function detach (target) {
  let handler = TargetHandlerMap.get(target);
  target.port.removeListener("chrome-api:request", handler);
};

function handleChromeRequest (target, { namespace, method, args, id, success, failure }) {
  console.log("Received request", arguments[1]);
  let fn = FunctionMap.get(`${namespace}.${method}`);

  // If not found, try fetching implementation for lazy loading.
  if (!fn) {
    try {
      require(`./api/${namespace}`);
      fn = FunctionMap.get(`${namespace}.${method}`);
    } catch (e) {
      console.log(e);
    }
  }

  // If still not found, API probably isn't implemented, send an alert
  // and respond to the request with empty data so it's not hanging.
  if (!fn) {
    utils.alertUnsupportedAPI(`${namespace}.${method}`);

    return;
  }

  // If the function has a success or failure callback, bind that so
  // we can respond back to the content script
  if (success) {
    args[success] = successCallback;
  }
  if (failure) {
    args[failure] = failureCallback;
  }

  // Call the implementation with the arguments received
  fn.apply(null, args);

  function successCallback () {
    target.port.emit("chrome-api:response", { id, res: arguments });
  }

  function failureCallback () {
    target.port.emit("chrome-api:response", { id, res: arguments, error: true });
  }
}

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

exports.bus = new EventTarget();
