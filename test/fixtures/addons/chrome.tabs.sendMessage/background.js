/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getCurrent(function(tab) {
    chrome.tabs.sendMessage(tab.id, {
      title: "MESSAGE TEST"
    }, function(response) {
      chrome.tabs.create({ url: "data:text/html;charset=utf-8,<title>"  + response + "</title>" })
    });
  });
}, false);
