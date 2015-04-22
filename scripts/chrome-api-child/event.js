/**
 * Handles event calls from platform. Takes an object with the following config:
 *
 * @param {string} name
 *        Name of the event, including namespace, like "tabs.onCreated".
 * @param {Array} args
 */
self.port.on("chrome-api:event", function ({ name, args }) {
  JETPACK.EventManager.handleEvent(name, args);
});

JETPACK.EventManager = {
  events: new Map(),
  getEvent: function (name) {
    if (this.events.has(name)) {
      return this.events.get(name);
    }
    let event = Event(name);
    this.events.set(name, event);
    return event;
  },
  handleEvent: function (name, args) {
    let event = this.events.get(name);

    if (!event) {
      return;
    }

    event._execute(args);
  }
}

/**
 * Definition for chrome.events.Event object defined:
 * https://developer.chrome.com/extensions/events#type-Event
 *
 * Does not yet support the Declarative Event API consisting of addRules, removeRules, and getRules.
 * https://developer.chrome.com/extensions/events#declarative
 *
 * TODO once Declarative Event API implemented, should make this more general
 * for both exposed events (chrome.alarm.onAlarm) and declarative events.
 *
 * This is not directly exposed to chrome.* APIs, but already attached
 * on some namespaces (`chrome.alarm.onAlarm`).
 */
let Event = JETPACK.Class({
  initialize: function (name) {
    this._name = name;
    this._events = new Set();
  },
  addListener: function addListener (callback) {
    this._events.add(callback);
  },
  removeListener: function removeListener (callback) {
    this._events.remove(callback);
  },
  hasListener: function hasListener (callback) {
    return this._events.has(callback);
  },
  hasListeners: function hasListeners () {
    return !!this._events.length;
  },
  _execute: function (args) {
    for (let ev of this._events) {
      ev.apply(unsafeWindow, cloneInto(args, unsafeWindow));
    }
  }
});
