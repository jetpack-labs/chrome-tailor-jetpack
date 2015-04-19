/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const self = require("sdk/self");
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { setTimeout } = require("sdk/timers");
const { emit, on, off } = require('sdk/event/core');
const events = require("sdk/system/events");

const { setup, emitter } = require("../lib/chrome-api-parent");

function create(options) {
  let icon = options.default_icon || "";
  let label = options.default_title || "blank";
  let url = options.default_popup || "";
  let manifest = require(options.rootURI + "manifest.json");

  let lastPanel;
  let button = ActionButton({
    id: "my-button",
    label: label,
    icon: icon,
    onClick: function(state) {
      if (url) {
        if (lastPanel) {
          lastPanel.destroy();
          lastPanel = null;
        }

        let panel = lastPanel = Panel({
          contentURL: url,
          contentScriptWhen: "start",
          contentScriptFile: self.data.url("chrome-api-child.js"),
          contentScriptOptions: {
            rootURI: options.rootURI,
            manifest: manifest
          },
          onHide: () => setTimeout(() => {
            panel.destroy();
            if (panel === lastPanel) {
              lastPanel = null;
            }
          }, 500)
        });

        setup({ target: panel });

        panel.show({
          position: button
        });
      }

      emit(emitter, "browser-action:onclicked");
    }
  });

  function unloadWait(event) {
    if (event.subject.name == manifest.name) {
      events.off("crx-unload", unloadWait, true);
      button.destroy();
      lastPanel && lastPanel.destroy();
    }
  }
  events.on("crx-unload", unloadWait, true);

  return button;
}
module.exports = create;
