
document.addEventListener('DOMContentLoaded', function() {
  let title = chrome.runtime.getManifest().name;

  chrome.tabs.create({
    url: "data:text/html;charset=utf-8,<title>" + title + "</title>"
  });
}, false);

