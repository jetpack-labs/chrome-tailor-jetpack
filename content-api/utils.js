/**
 * Takes an object with functions, and constructs a factory for this object.
 * Instances also have a new method, `getShadow()`, returning a shimmed
 * version of the instance for use in `unsafeWindow` context, whose function calls
 * are stitched together here with the real instance.
 *
 * This is totally overengineered, but every other method was tripped up by
 * something with security, sandboxes, or xrays.
 */
function Class (Base) {
  let InstanceMap = new Map();

  // Strip out `initialize` function and any `_` properties
  // for the shadow API.
  let shadowAPI = Object.keys(Base).reduce((shadow, prop) => {
    if (prop === "initialize" || prop[0] === "_") {
      return shadow;
    }

    let proxy = function () {
      return Base[prop].apply(InstanceMap.get(this), arguments);
    };

    shadow[prop] = exportFunction(proxy, unsafeWindow);

    return shadow;
  }, createObjectIn(unsafeWindow));

  return function () {
    let realInstance = Object.create(Base);
    realInstance.initialize.apply(realInstance, arguments);
    let shadowInstance = cloneInto(shadowAPI, unsafeWindow, { cloneFunctions: true });
    InstanceMap.set(shadowInstance, realInstance);

    realInstance.getShadow = () => shadowInstance;

    return realInstance;
  };
}
JETPACK.Class = Class;
