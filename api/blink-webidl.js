var webidl = require("webidl2");

function parse (string) {
  return webidl.parse(cleanWebIDL(string));
}
exports.parse = parse;

/**
 * Blink WebIDL has a few differences compared to standard WebIDL.
 * This mostly just parses them out as we don't need them for this case.
 *
 * Dirty as hell.
 */
function cleanWebIDL (string) {
  var chunks = string.split("\n").filter(filterEmpty);
  var validChunks = [];
  var valid = false;
  var IN_ENUM = false;
  var chunk;

  for (var i = 0; i < chunks.length; i++) {
    chunk = chunks[i];
    valid = true;
    // First strip the namespace struct, as the webidl2 doesn't parse that
    // (and I don't think that's a standard webidl instruction?)
    if (chunk.indexOf("namespace") === 0 || i === chunks.length - 1) {
      valid = false;
    }

    // "any" types cannot be nullable.
    chunk = fixNullableAny(chunk);

    // Filter out extra attributes like [nocompile]
    if (/\[[\w_]+\]/.test(chunk)) {
      console.log("REPLAC ATTR");
      console.log(chunk);
      chunk = chunk.replace(/\[[\w_]+]/g, "");
      console.log(chunk);
    }

    if (/\};/.test(chunk)) {
      IN_ENUM = false;
    }

    // enum values must be quoted.
    if (IN_ENUM) {
      var identifier = chunk.match(/([\w_]+)/);
      identifier = identifier[1];
      chunk = chunk.replace(identifier, "\"" + identifier + "\"");
    }

    // Is this the start of an enum
    if (/enum\s(\w+)\s\{/.test(chunk)) {
      IN_ENUM = true;
    }

    if (valid) {
      validChunks.push(chunk);
    }
  }

//  console.log(validChunks.join("\n"));
  return validChunks.join("\n");
}

function filterEmpty (string) {
  return string.length > 0 && string[0] !== "\n";
}

/**
 * "any" types cannot be nullable. Get rid of the "?".
 */
function fixNullableAny (line) {
  if (/\sany\?\s/.test(line)) {
    line = line.replace(/\sany\?\s/, " any ");
  }
  return line;
}

/**
 * Blink has extra attributes that webidl2 can't parse.
 * We aren't using them now, and maybe never, so just get rid of them.
 */
function fixExtraAttrs (line) {
  // Filter out extra attributes like [nocompile]
  if (/\[[\w_]+\]/.test(chunk)) {
    line = line.replace(/\[[\w_]+\s?]/g, "");
  }
  return line;
}
