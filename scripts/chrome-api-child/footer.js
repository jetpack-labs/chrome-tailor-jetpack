/**
 * The last piece injected into the content, takes the definition stub
 * from ./definitions/stub.json (stored at self.JETPACK.API_DEFINITIONS)
 * and creates the API objects and function/event hooks in the proper scope.
 */
let definitions = JETPACK.API_DEFINITIONS;
let chrome = unsafeWindow.chrome = createObjectIn(unsafeWindow);

Object.keys(definitions).forEach(namespace => {
  let def = definitions[namespace];
  bindFunctions(namespace, def.functions);
  bindEvents(namespace, def.events);
});

/**
 * Returns the corresponding object related to a string name of
 * a namespace. Converts "devtools.inspectedWindow", and returns
 * the object found at `unsafeWindow.chrome.devtools.inspectedWindow`, creating
 * objects along the path if needed in the unsafeWindow scope.
 */
function getNamespace (namespace) {
  let namespaces = namespace.split(".");
  let parent = chrome;
  for (let name of namespaces) {
    parent[name] = parent[name] || createObjectIn(unsafeWindow);
    parent = parent[name];
  }
  return parent;
}

/**
 * Binds functions to their parent namespace, creating the namespace
 * itself if it does not exist.
 */
function bindFunctions (namespace, functions=[]) {
  let ns = getNamespace(namespace);
  functions.forEach(fnDef => {
    let { name: method, successCallbackIndex: success, failureCallbackIndex: failure } = fnDef;
    exportFunction(JETPACK.RPC.bind(null, { namespace, method, success, failure }), ns, { defineAs: method });
  });
}

function bindEvents (namespace, events=[]) {
  let ns = getNamespace(namespace);
  events.forEach(name => {
    // EventManager.getEvent caches the event instance,
    // so we can lazily load event objects
    Object.defineProperty(ns, name, {
      get: exportFunction(() => JETPACK.EventManager.getEvent(`${namespace}.${name}`).getShadow(), ns)
    });
  });
}
