var fs = require("fs");
var path = require("path");
var shush = require("shush");
var webidl = require("./blink-webidl");

// Only attempt to parse APIs that are listed in docs
// as stable and for extensions.
var VALID_APIS = require("./api-names.json").stable;

var commonDef = parseDefinition(path.join(__dirname, "common"));
var chromeDef = parseDefinition(path.join(__dirname, "chrome"));

function parseDefinition (filePath) {

  var manifest = shush(path.join(filePath, "_api_features.json"));
  // Iterate over each defined feature
  var definition = Object.keys(manifest).filter(isValidNamespace).reduce(function (definition, feature) {
    var features = feature.split(".");
    var namespace = features[0];
    var ns = definition[namespace] = definition[namespace] || {};

    if (features.length === 1) {
      definition[feature]._meta = getMeta(manifest[feature]);
    } else {
    
    }

    var pathToDefinition = path.join(filePath, feature.replace(/\./g, "_"));
    var pathToDefinitionJSON = pathToDefinition + ".json";
    var pathToDefinitionWebIDL = pathToDefinition + ".idl";
    var featureDefinition;

    if (fs.existsSync(pathToDefinitionJSON)) {
      featureDefinition = parse(pathToDefinitionJSON);  
    } else if (fs.existsSync(pathToDefinitionWebIDL)) {
      featureDefinition = parse(pathToDefinitionWebIDL);  
    } else {
      console.warn("No JSON or WebIDL found for " + pathToDefinition);
    }

    console.log(featureDefinition);
    return definition;
  }, {});

  console.log(definition);
}

function parse (file) {
  var parser = path.extname(file) === ".idl" ? parseWebIDL : parseJSON;
  return parser(file);
}

function parseWebIDL (p) {
  var string = fs.readFileSync(p, "utf8");
  return webidl.parse(string);
}

function parseJSON (file) {

}

// Takes an object from an _api_features.json and returns a filtered
// object with properties that we want.
function getMeta (obj) {
  var META_PROPS = ["dependencies", "contexts"];
  var props = Object.keys(obj).filter(function (p) { return ~META_PROPS.indexOf(p); });
  var meta = {};
  for (var i = 0; i < props.length; i++) {
    meta[props[i]] = obj[props[i]];
  }
  return meta;
}

/**
 * Return boolean indicating if this is a valid namespace, based on
 * `api-names.json`, for what is possible to be supported.
 *
 * We could get namespaces like "runtime.connect", which is a valid method in a valid
 * namespace ("runtime"), but the corresponding idl/json will define this function,
 * and we can subsequently recheck the _api_features.json definition for
 * meta, like permissions and contexts.
 */
function isValidNamespace (namespace) {
  return !!~VALID_APIS.indexOf(namespace);
}
