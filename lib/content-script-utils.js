/**
 * Converts Chrome Match Patterns to Firefox Match Patterns.
 * Used for host permissions and content script matching.
 *
 * https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_match-pattern
 * https://developer.chrome.com/extensions/match_patterns
 */

function convertPattern (chromePatterns) {
  chromePatterns = [].concat(chromePatterns);
  var starUsed = false;

  let result = chromePatterns.map(pattern => {
    console.log(":",pattern);
    // exact match "http://google.com"
    // wildcard "*"
    // domain prefix "*.example.com"
    // url plus wild: "http://blah.com/*"
    // scheme plus wild: "https://*"

    // Match all
    if (pattern === "<all_urls>") {
      starUsed = true;
      return "*";
    }

    // Exact match
    if (pattern.indexOf("*") === -1) {
      return pattern;
    }

    // Return wildcard for now for testing
    return "*";
  });

  if (starUsed) {
    result.push("data:*")
  }

  console.log(result);
  return result;
}
exports.convertPattern = convertPattern;
