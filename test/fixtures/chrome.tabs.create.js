
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.create({
    url: "data:text/html;charset=utf-8,<title>Created Tab 1</title>"
  }, function(tab) {
    chrome.tabs.create({ url: "data:text/html;charset=utf-8,<title>Created Tab 2</title>" })
  });
}, false);
