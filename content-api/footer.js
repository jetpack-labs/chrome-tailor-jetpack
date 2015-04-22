/**
 * The last piece injected into the content, takes the definition stub
 * from ./definitions/stub.json (stored at self.JETPACK.API_DEFINITIONS)
 * and creates the API objects and function/event hooks in the proper scope.
 */
let definitions = JETPACK.API_DEFINITIONS;
let chrome = unsafeWindow.chrome = createObjectIn(unsafeWindow);
let apiTypes = {};

Object.keys(definitions).map(namespace => {
  // First, register all the types upfront.
  bindTypes(namespace, definitions[namespace].types);
  return namespace;
}).forEach(namespace => {
  // Then bind everything else
  let def = definitions[namespace];
  bindDefinition(namespace, def);
});

function bindDefinition (namespace, def) {
  bindFunctions(namespace, def.functions);
  bindEvents(namespace, def.events);
  bindProperties(namespace, def.properties);
}

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
    let name = `${namespace}.${method}`;
    exportFunction(JETPACK.RPC.bind(null, { name, success, failure }), ns, { defineAs: method });
  });
}

/**
 * Stores type information if used elsewhere. Only used for
 * contentSettings.ContentSetting, storage.StorageArea, and types.ChromeSetting.
 * `bindProperties` ends up using this data.
 */
function bindTypes (namespace, types={}) {
  Object.keys(types).forEach(type=> {
    let typeName = `${namespace}.${type}`;
    apiTypes[typeName] = types[type];
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

function bindProperties (namespace, properties={}) {
  Object.keys(properties).forEach(prop => {
    let def = properties[prop];
    if (def.getter) {
      // Not yet implemented
    }
    // For containers, recursively bind its children functions/events/props, etc
    else if (def.container) {
      bindDefinition(`${namespace}.${prop}`, def);
    }
    // If this object a class, (storage.StorageArea, etc), implement its props and functions
    // as well
    else if (def.class) {
      // If type isn't scoped, it means it's part of the same namespace.
      let typeName = def.class.indexOf(".") === -1 ? `${namespace}.${def.class}` : def.class;
      let typeDef = apiTypes[typeName];
      if (!typeDef) {
        throw new Error(`No type definition found for ${def.class} in ${namespace}.`);
      }
      bindDefinition(`${namespace}.${prop}`, typeDef);

      // Also bind the original definition, as it can contain additional
      // properties
      bindDefinition(`${namespace}.${prop}`, def);
    }
    // If this is just a value, probably an enum or constant -- just set
    else if (def.value != null) {
      getNamespace(namespace)[prop] = def.value;
    }
  });
}
