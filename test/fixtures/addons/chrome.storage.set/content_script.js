/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

console.log("get storage! " + document.title);

(() => {
if (document.title != "chrome.storage.set") {
  return null;
}

chrome.storage.local.get({ "urls": [] }, function({ urls }) {
  console.log("got storage!");
  if (urls.length >= 1) {
    return null;
  }

  urls.push(window.location.href + "");
  console.log("set storage!");
  chrome.storage.local.set({ "urls": urls }, function() {
    if (urls.length == 1) {
      chrome.tabs.create({ url: "data:text/html;charset=utf-8,<title>"  + window.document.title + " DONE</title>" });
    }
  });
});
})();
