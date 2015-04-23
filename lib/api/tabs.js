/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { chromeEvent, registerChromeFunction } = require("../chrome-api-controller");

const tabs = require("sdk/tabs");
const self = require("sdk/self");

let tabIndex = 0;
const tabsMap = new WeakMap();

/**
 * TODO function that takes a Firefox Tab and returns a Chrome Tab type,
 * many methods here return a tab object and we are not currently matching it
 * as best as we can.
 * https://developer.chrome.com/extensions/tabs#type-Tab
 */

registerChromeFunction("tabs.duplicate", function (tabID, callback) {
  var url = getTabForID(tabID).url;
  tabs.open({
    url: url,
    onLoad: tab => {
      let chromeTab = {
        id: getTabID(tab),
        url: url,
        title: tab.title,
        // TODO: implement this!
        favIconUrl: undefined
      };
      callback(chromeTab);
    }
  });
});

registerChromeFunction("tabs.remove", function (tabs, callback) {
  var tabIDs = (Array.isArray(tabs) ? tabs : [ tabs ]).sort();
  for (let i = tabIDs.length - 1; i >= 0; i--) {
    let tab = getTabForID(tabIDs[i]);
    tab && tab.close();
  }
  callback();
});

registerChromeFunction("tabs.query", function (data, callback) {
  var result = [];
  for (let tab of tabs) {
    result.push({
      url: tab.url
    });
  }
  callback(result);
}, "Does not support query data.");

registerChromeFunction("tabs.getCurrent", function (callback) {
  var activeTab = tabs.activeTab;
  callback({
    id: getTabID(activeTab),
    url: activeTab.url,
    title: activeTab.title
  });
});

registerChromeFunction("tabs.executeScript", function (tabID, data, callback) {
  let tab = (!tabID) ? tabs.activeTab : tabs[tabID];
  let runAt = data.runAt ? data.runAt.replace(/^document_/i, "") : "ready";

  if (runAt == "idle") {
    runAt = "ready";
  }

  if (data.code) {
    tab.attach({
      contentScriptWhen: runAt,
      contentScript: data.code,
      onAttach: () => callback()
    });
  }
  else {
    tab.attach({
      contentScriptWhen: runAt,
      contentScriptFile: getURL(data.file),
      onAttach: () => callback()
    });
  }
}, "Does not return evaluated value of script.");

registerChromeFunction("tabs.create", function (options, callback) {
  var url = options.url;
  tabs.open({
    url: url,
    onLoad: tab => {
      let chromeTab = {
        id: getTabID(tab),
        url: url,
        title: tab.title,
        // TODO: implement this!
        favIconUrl: undefined
      };
      callback(chromeTab);
      chromeEvent("tabs.onCreated", chromeTab);
    }
  });
}, "Many creation options are not supported.");


registerChromeFunction("tabs.sendMessage", function (tabID, message, options, callback) {
  
}, "runtime.onMessage event is not fired.");

/*
  target.port.on("tabs:send:message", function(data) {
    emit(emitter, "tabs:send:message", data);
  });

  target.port.on("tabs:message:response", function(data) {
    emit(emitter, "tabs:got:message", data);
  });

  function tabsGotMessage(data) {
    target.port.emit("tabs:got:message", data);
  }
  on(emitter, "tabs:got:message", tabsGotMessage);
  target.once("detach", () => {
    off(emitter, "tabs:got:message", tabsGotMessage);
  })

*/

function getURL(path) {
  return self.data.url("./crx/" + path);
}

function getTabID(tab) {
  if (!tabsMap.has(tab)) {
    tabsMap.set(tab, tabIndex++);
  }
  return tabsMap.get(tab);
}

function getTabForID(id) {
  for (let i = tabs.length -1; i >= 0; i--) {
    let tab = tabs[i];
    let tabID = getTabID(tab);
    if (tabID == id) {
      return tab;
    }
  }
  return null;
}
