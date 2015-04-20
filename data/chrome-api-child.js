/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

// chrome.tabs.query(queryInfo, function(tabs) {

var chrome = createObjectIn(unsafeWindow, { defineAs: "chrome" });
var tabs = createObjectIn(chrome, { defineAs: "tabs" });
var extension = createObjectIn(chrome, { defineAs: "extension" });
var history = createObjectIn(chrome, { defineAs: "history" });
var topSites = createObjectIn(chrome, { defineAs: "topSites" });

var runtime = createObjectIn(chrome, { defineAs: "runtime" });
var onMessage = createObjectIn(runtime, { defineAs: "onMessage" });

var browserAction = createObjectIn(chrome, { defineAs: "browserAction" });
var onClicked = createObjectIn(browserAction, { defineAs: "onClicked" });

var id = 0;
var runtimeCallbacks = [];


// START: chrome.tabs.*

function tabsQuery(options, callback) {
  var queryID = id++;

  self.port.on("tabs:query:result", function tabsResults(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:query:result", tabsResults);
      callback && callback(cleanse(data.tabs));
    }
    return null;
  });

  self.port.emit("tabs:query", {
    id: queryID
  });
}
exportFunction(tabsQuery, tabs, { defineAs: "query" });

function tabsRemove(tabIds, callback) {
  var queryID = id++;

  self.port.on("tabs:removed", function tabsRemoved(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:removed", tabsRemoved);
      callback && callback();
    }
    return null;
  });

  self.port.emit("tabs:remove", {
    id: queryID,
    tabs: tabIds
  });
}
exportFunction(tabsRemove, tabs, { defineAs: "remove" });

function tabDuplicate(tabId, callback) {
  var queryID = id++;

  self.port.on("tabs:duplicated", function tabDuplicated(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:duplicated", tabDuplicated);
      callback && callback(data.tab);
    }
    return null;
  });

  self.port.emit("tabs:duplicate", {
    id: queryID,
    tabId: tabId
  });
}
exportFunction(tabDuplicate, tabs, { defineAs: "duplicate" });

function tabsGetCurrent(callback) {
  var queryID = id++;

  self.port.on("tabs:got:current", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:got:current", wait);
      callback && callback(cleanse(data.tab));
    }
    return null;
  });

  self.port.emit("tabs:get:current", {
    id: queryID
  });
}
exportFunction(tabsGetCurrent, tabs, { defineAs: "getCurrent" });

function tabsCreate(options, callback) {
  var queryID = id++;

  self.port.on("tabs:created", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:created", wait);
      callback && callback(cleanse(data.tab));
    }
    return null;
  });

  self.port.emit("tabs:create", {
    id: queryID,
    options: options
  });
}
exportFunction(tabsCreate, tabs, { defineAs: "create" });

function tabsExecuteScript(tabId, details, callback) {
  var queryID = id++;
  // tabId is optional
  if (typeof tabId == "object") {
    let newDetails = tabId;
    callback = details;
    details = newDetails;
    tabId = undefined;
  }

  self.port.on("tabs:executed:script", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:executed:script", wait);
      // TODO: implement results
      callback && callback();
    }
    return null;
  });

  self.port.emit("tabs:execute:script", {
    id: queryID,
    tabId: tabId,
    details: details
  });
}
exportFunction(tabsExecuteScript, tabs, { defineAs: "executeScript" });

function tabsSendMessage(tabId, message, options, callback) {
  var queryID = id++;
  if (typeof options == "function") {
    callback = options;
    options = null;
  }

  self.port.on("tabs:got:message", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("tabs:got:message", wait);
      // TODO: implement results
      callback && callback(data.result);
    }
    return null;
  });

  self.port.emit("tabs:send:message", {
    id: queryID,
    tabId: tabId,
    message: message
  });
}
exportFunction(tabsSendMessage, tabs, { defineAs: "sendMessage" });

self.port.on("tabs:send:message", function(data) {
  var responseMade = false;
  function sendResponse(result) {
    if (responseMade) {
      return null;
    }
    responseMade = true;
    self.port.emit("tabs:message:response", {
      id: data.id,
      result: result
    })
  }

  var MessageSender = {};
  if (data.tabId) {
    MessageSender.tab = {
      id: data.tabId
    };
  }

  runtimeCallbacks.forEach(cb => {
    cb(cleanse(data.message), cleanse(MessageSender), sendResponse);
  });
});


// END: chrome.tabs.*


// START: chrome.runtime.*

exportFunction(extGetURL, runtime, { defineAs: "getURL" });

function getCRXManifest() {
  return self.options.manifest;
}
exportFunction(getCRXManifest, runtime, { defineAs: "getManifest" });

function runtimeSendMessage(extensionId, message, options, responseCallback) {
  var queryID = id++;
  if (typeof options == "function") {
    responseCallback = options;
    options = {};
  }

  self.port.on("runtime:message:response:callback", function wait(data) {
    if (queryID != data.id) {
      return null;
    }
    self.port.removeListener("runtime:message:response:callback", wait);

    responseCallback(data.response);
  });

  self.port.emit("runtime:send:message", {
    id: queryID,
    extensionId: extensionId,
    message: message
  });
}
exportFunction(runtimeSendMessage, runtime, { defineAs: "sendMessage" });

// Note: PageMods do not recieve this message
self.port.on("runtime:send:message", function(data) {
  function sendResponse(response) {
    self.port.emit("runtime:message:response:callback", {
      id: data.id,
      response: response
    });
  }

  var MessageSender = {};
  if (data.tabId) {
    MessageSender.tab = {
      id: data.tabId
    };
  }
  if (data.extensionId) {
    MessageSender.id = extensionId;
  }

  runtimeCallbacks.forEach(cb => {
    cb(cleanse(data.message), cleanse(MessageSender), sendResponse);
  });
});

function runtimeOnMessage(callback) {
  if (typeof callback == "function") {
    runtimeCallbacks.push(callback);
  }
}
exportFunction(runtimeOnMessage, onMessage, { defineAs: "addListener" });

// END: chrome.runtime.*


// START: chrome.extension.*

function extGetURL(path) {
  path = path.replace(/^\\/, "");
  return self.options.rootURI + path;
}
exportFunction(extGetURL, extension, { defineAs: "getURL" });

function isAllowedIncognitoAccess(callback) {
  callback(false);
}
exportFunction(isAllowedIncognitoAccess, extension, { defineAs: "isAllowedIncognitoAccess" });

function isAllowedFileSchemeAccess(callback) {
  callback(false);
}
exportFunction(isAllowedFileSchemeAccess, extension, { defineAs: "isAllowedFileSchemeAccess" });

function setUpdateUrlData(data) {
  // do nothing..
}
exportFunction(setUpdateUrlData, extension, { defineAs: "setUpdateUrlData" });

extension.inIncognitoContext = false;

// END: chrome.extension.*


// START: chrome.history.*

function historyDeleteURL(options, callback) {
  var queryID = id++;

  self.port.on("history:deleted:url", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("history:deleted:url", wait);
      callback && callback();
    }
    return null;
  });

  self.port.emit("history:delete:url", {
    id: queryID,
    url: options.url
  });
}
exportFunction(historyDeleteURL, history, { defineAs: "deleteUrl" });

function historyDeleteAll(callback) {
  var queryID = id++;

  self.port.on("history:deleted:all", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("history:deleted:all", wait);
      callback && callback();
    }
    return null;
  });

  self.port.emit("history:delete:all", {
    id: queryID
  });
}
exportFunction(historyDeleteAll, history, { defineAs: "deleteAll" });

function historyAddURL(options, callback) {
  var queryID = id++;

  self.port.on("history:added:url", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("history:added:url", wait);
      callback && callback();
    }
    return null;
  });

  self.port.emit("history:add:url", {
    id: queryID,
    url: options.url
  });
}
exportFunction(historyAddURL, history, { defineAs: "addUrl" });

// END: chrome.history.*


// START: chrome.topSites.*

function getTopSites(callback) {
  var queryID = id++;

  self.port.on("history:got:topsites", function wait(data) {
    if (data.id == queryID) {
      self.port.removeListener("history:got:topsites", wait);
      callback && callback(cleanse(data.urls));
    }
    return null;
  });

  self.port.emit("history:get:topsites", {
    id: queryID
  });
}
exportFunction(getTopSites, topSites, { defineAs: "get" });


// END: chrome.topSites.*


// START: chrome.browserAction.*

function browserActionOnClick(callback) {
  var queryID = id++;

  self.port.on("browser-action:onclicked", function wait(data) {
    if (data.id == queryID) {
      callback && callback(cleanse(data.tab));
    }
    return null;
  });

  self.port.emit("browser-action:onclick", {
    id: queryID
  });
}
exportFunction(browserActionOnClick, onClicked, { defineAs: "addListener" });


// END: chrome.browserAction.*


function cleanse(obj) {
  return unsafeWindow.JSON.parse(JSON.stringify(obj));
}
